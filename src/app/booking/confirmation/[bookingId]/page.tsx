'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2, Hotel, Plane, Calendar, CreditCard,
  ChevronRight, Bookmark, ArrowRight,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  const supabase = createClient();

  const fetchBooking = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      if (error) throw error;
      setBooking(data);
    } catch {
      setError('Failed to load booking details. It may not exist or you may not have access.');
    } finally {
      setLoading(false);
    }
  }, [bookingId, supabase]);

  React.useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId, fetchBooking]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex-grow max-w-xl mx-auto px-4 py-12 bg-[#F0F4F8]">
        <ErrorState title="Booking Not Found" message={error || 'Invalid booking reference.'} />
      </main>
    );
  }

  const isHotel = booking.booking_type === 'hotel';
  const offer   = booking.offer_snapshot;

  return (
    <main className="flex-1 bg-[#F0F4F8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Success banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Booking Confirmed
            </p>
            <h1 className="text-3xl font-black text-gray-900">You&apos;re All Set!</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Your sandbox booking has been processed and confirmed via LiteAPI.
            </p>
          </div>
        </div>

        {/* Booking summary card */}
        <div className="ota-card bg-white overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 border border-blue-100">
                {isHotel
                  ? <Hotel className="w-4 h-4 text-[#0F4C81]" aria-hidden />
                  : <Plane className="w-4 h-4 -rotate-45 text-[#0F4C81]" aria-hidden />
                }
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {isHotel ? offer.name : `${offer.airline} · ${offer.origin} → ${offer.destination}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ref:{' '}
                  <span className="font-bold text-gray-600">{booking.liteapi_booking_id || '—'}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full">
              Confirmed
            </span>
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 text-sm">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden />
                  Dates
                </p>
                <p className="font-semibold text-gray-800">
                  {isHotel
                    ? `${formatDate(booking.check_in)} — ${formatDate(booking.check_out)}`
                    : formatDate(booking.departure_date)
                  }
                </p>
                {!isHotel && booking.return_date && (
                  <p className="text-xs text-gray-500 mt-0.5">Return: {formatDate(booking.return_date)}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  {isHotel ? 'Guests' : 'Passengers'}
                </p>
                <p className="font-semibold text-gray-800">
                  {booking.guest_details?.length ?? '—'}{' '}
                  {isHotel ? 'guest' : 'passenger'}
                  {(booking.guest_details?.length ?? 0) > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Payment row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <CreditCard className="w-4 h-4 text-gray-400" aria-hidden />
                <span>Simulated Sandbox Payment</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Paid</p>
                <p className="text-xl font-black text-[#0F4C81] tabular-nums">
                  {formatCurrency(booking.total_price, booking.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profile">
            <Button variant="outline" className="w-full sm:w-auto gap-2 py-2.5 font-bold">
              <Bookmark className="w-4 h-4" aria-hidden />
              View My Bookings
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto gap-2 py-2.5 font-bold">
              Plan Another Trip
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
