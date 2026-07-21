import { NextRequest, NextResponse } from 'next/server';
import { bookHotel, prebookRate } from '@/lib/liteapi/hotels';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { hotelBookingRequestSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Require email verification before booking
  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { data: null, error: 'Email verification is required before making bookings. Please check your inbox.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = hotelBookingRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prebookId, idempotencyKey, guests, specialRequests, searchSnapshot, offerSnapshot } = result.data;

    // 3. Check Idempotency: Query db for this idempotency key
    // We use service client to check to avoid any RLS/policy issues for duplicate query checks.
    const serviceClient = createServiceClient();
    const { data: existingBooking, error: queryError } = await serviceClient
      .from('bookings')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (queryError) {
      console.error('Idempotency query error:', queryError);
      return NextResponse.json({ data: null, error: 'Database check failed' }, { status: 500 });
    }

    if (existingBooking) {
      console.log(`Duplicate request detected. Returning existing booking: ${existingBooking.id}`);
      return NextResponse.json({ data: existingBooking });
    }

    // 4. Re-validate offer status via LiteAPI
    // Let's call Retrieve Prebook status (by checking LiteAPI prebook status,
    // or by executing prebook again on the offer, or using the prebooked price/session)
    // Here we've already done prebook in the previous step and got a prebookId.
    // Let's make sure the price in offerSnapshot matches what the client claims (or prebook claims).
    // To do this, we can optionally fetch the prebook detail to double check price matches.
    // If they differ, abort.
    // For this project, using prebookId natively validates the rate because LiteAPI locks the rate
    // for this prebookId. We will retrieve the rate parameters.
    const prebookVerification = await prebookRate(String(offerSnapshot.rateId || offerSnapshot.offerId));
    
    const clientPrice = Number(offerSnapshot.price);
    const apiPrice = Number(prebookVerification.price);

    if (Math.abs(clientPrice - apiPrice) > 0.01) {
      return NextResponse.json(
        { data: null, error: 'Price discrepancy detected. The rate has updated. Please search again.' },
        { status: 409 }
      );
    }

    // 5. Complete LiteAPI Booking
    let bookingResult: { bookingId: string; status: string };
    try {
      bookingResult = await bookHotel({
        prebookId,
        guests,
      });
    } catch (bookingError: any) {
      console.error('LiteAPI hotel booking failed:', bookingError);
      return NextResponse.json(
        { data: null, error: bookingError.message || 'LiteAPI booking failed. Please try again.' },
        { status: bookingError.status || 400 }
      );
    }

    // 6. Record to Supabase
    // If write fails after confirmed book, log clearly and ask user to contact support
    const checkIn = searchSnapshot.checkIn as string || null;
    const checkOut = searchSnapshot.checkOut as string || null;

    const { data: newBooking, error: insertError } = await serviceClient
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_type: 'hotel',
        liteapi_booking_id: bookingResult.bookingId,
        idempotency_key: idempotencyKey,
        status: bookingResult.status === 'confirmed' ? 'confirmed' : 'pending',
        payment_status: 'mock_paid',
        search_snapshot: searchSnapshot,
        offer_snapshot: offerSnapshot,
        guest_details: guests,
        total_price: apiPrice,
        currency: prebookVerification.currency || 'USD',
        check_in: checkIn,
        check_out: checkOut,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        `CRITICAL ERROR: LiteAPI hotel booking succeeded (Ref: ${bookingResult.bookingId}) but Supabase write failed.`,
        insertError
      );
      return NextResponse.json(
        {
          data: null,
          error: `Your booking was confirmed by the hotel, but a system recording error occurred. Please contact support immediately with your confirmation reference: "${bookingResult.bookingId}".`,
          code: 'DATABASE_WRITE_FAILED',
          liteapiBookingId: bookingResult.bookingId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newBooking });
  } catch (error: any) {
    console.error('Error in hotel booking handler:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'An unexpected booking error occurred' },
      { status: 500 }
    );
  }
}
