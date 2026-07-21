import { NextRequest, NextResponse } from 'next/server';
import { bookFlight } from '@/lib/liteapi/flights';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { z } from 'zod';
import { passengerDetailsSchema } from '@/lib/validations';

const flightBookingRequestSchema = z.object({
  offerId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  passengers: z.array(passengerDetailsSchema),
  searchSnapshot: z.record(z.string(), z.unknown()),
  offerSnapshot: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Email verification
  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { data: null, error: 'Email verification is required before booking flights. Please verify your email.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = flightBookingRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { offerId, idempotencyKey, passengers, searchSnapshot, offerSnapshot } = result.data;

    // 3. Idempotency Check
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
      console.log(`Duplicate request detected. Returning existing flight booking: ${existingBooking.id}`);
      return NextResponse.json({ data: existingBooking });
    }

    // 4. LiteAPI / Mock Booking execution
    let bookingResult: { bookingId: string; status: string };
    try {
      bookingResult = await bookFlight({
        offerId,
        passengers,
        idempotencyKey,
      });
    } catch (bookingError: any) {
      console.error('LiteAPI flight booking failed:', bookingError);
      return NextResponse.json(
        { data: null, error: bookingError.message || 'Flight booking failed. Please try again.' },
        { status: bookingError.status || 400 }
      );
    }

    // 5. Database entry
    const departureDate = searchSnapshot.departureDate as string || null;
    const returnDate = searchSnapshot.returnDate as string || null;
    const price = Number(offerSnapshot.price) || 0;
    const currency = (offerSnapshot.currency as string) || 'USD';

    const { data: newBooking, error: insertError } = await serviceClient
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_type: 'flight',
        liteapi_booking_id: bookingResult.bookingId,
        idempotency_key: idempotencyKey,
        status: bookingResult.status === 'confirmed' ? 'confirmed' : 'pending',
        payment_status: 'mock_paid',
        search_snapshot: searchSnapshot,
        offer_snapshot: offerSnapshot,
        guest_details: passengers,
        total_price: price,
        currency: currency,
        departure_date: departureDate,
        return_date: returnDate,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        `CRITICAL ERROR: Flight booking succeeded (Ref: ${bookingResult.bookingId}) but Supabase write failed.`,
        insertError
      );
      return NextResponse.json(
        {
          data: null,
          error: `Your flight was confirmed by the airline, but a recording error occurred. Please contact support with confirmation reference: "${bookingResult.bookingId}".`,
          code: 'DATABASE_WRITE_FAILED',
          liteapiBookingId: bookingResult.bookingId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newBooking });
  } catch (error: any) {
    console.error('Error in flight booking route:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'An unexpected booking error occurred' },
      { status: 500 }
    );
  }
}
