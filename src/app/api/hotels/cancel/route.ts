import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/liteapi/hotels';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ data: null, error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch the booking row to make sure the user owns it and it's confirmed
    // (RLS ensures user can only see their own booking, but let's double check)
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ data: null, error: 'Booking not found or access denied' }, { status: 404 });
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ data: null, error: 'Only confirmed bookings can be cancelled' }, { status: 400 });
    }

    if (!booking.liteapi_booking_id) {
      return NextResponse.json({ data: null, error: 'No LiteAPI reference found' }, { status: 400 });
    }

    // Call LiteAPI cancellation
    try {
      const isCancelled = await cancelBooking(booking.liteapi_booking_id);
      if (!isCancelled) {
        throw new Error('LiteAPI rejected cancellation policy (non-refundable rate)');
      }
    } catch (cancelError: any) {
      console.error('LiteAPI cancellation rejected:', cancelError);
      return NextResponse.json(
        {
          data: null,
          error: cancelError.message || 'This booking is non-refundable or cannot be cancelled under the current cancellation policy.',
        },
        { status: 400 }
      );
    }

    // Update DB row using service client
    const serviceClient = createServiceClient();
    const { data: updatedBooking, error: updateError } = await serviceClient
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update booking status in DB after LiteAPI cancel:', updateError);
      return NextResponse.json(
        {
          data: null,
          error: 'Your booking has been cancelled with the provider, but we encountered an error updating our records. Please contact support.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedBooking });
  } catch (error: any) {
    console.error('Error cancelling booking route:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'An unexpected cancellation error occurred' },
      { status: 500 }
    );
  }
}
