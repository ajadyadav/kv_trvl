'use client';

import * as React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { GuestDetailsForm } from '@/components/booking/GuestDetailsForm';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { generateIdempotencyKey } from '@/lib/utils';
import { ArrowLeft, Hotel, ChevronRight, MailWarning, MapPin, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

function HotelBookingContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const offerId     = params.offerId as string;
  const rateId      = searchParams.get('rateId') || '';
  const checkIn     = searchParams.get('checkIn') || '';
  const checkOut    = searchParams.get('checkOut') || '';
  const adults      = Number(searchParams.get('adults')) || 2;
  const children    = Number(searchParams.get('children')) || 0;
  const rooms       = Number(searchParams.get('rooms')) || 1;
  const destination = searchParams.get('destination') || '';

  const [prebookData, setPrebookData]   = React.useState<any | null>(null);
  const [prebookLoading, setPrebookLoading] = React.useState(true);
  const [prebookError, setPrebookError] = React.useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = React.useState('');

  React.useEffect(() => { setIdempotencyKey(generateIdempotencyKey()); }, []);

  const runPrebook = React.useCallback(async () => {
    setPrebookLoading(true);
    setPrebookError(null);
    try {
      const res = await fetch('/api/hotels/prebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'The room rate is no longer available. Please search again.');
      setPrebookData(json.data);
    } catch (err: any) {
      setPrebookError(err.message || 'Prebook rate check failed.');
    } finally {
      setPrebookLoading(false);
    }
  }, [rateId]);

  React.useEffect(() => {
    if (rateId) { runPrebook(); }
    else { setPrebookError('Missing rate details.'); setPrebookLoading(false); }
  }, [rateId, runPrebook]);

  const handleConfirmBooking = async (formData: any) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch('/api/hotels/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prebookId: prebookData.prebookId,
          idempotencyKey,
          guests: formData.guests,
          specialRequests: formData.specialRequests,
          searchSnapshot: { checkIn, checkOut, adults, children, rooms, destination },
          offerSnapshot: {
            hotelId: prebookData.hotelId,
            name: prebookData.name,
            roomType: prebookData.roomType,
            boardType: prebookData.boardType,
            price: prebookData.price,
            currency: prebookData.currency,
            rateId: prebookData.rateId,
            offerId,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to complete booking.');
      router.push(`/booking/confirmation/${json.data.id}`);
    } catch (err: any) {
      setBookingError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (authLoading || prebookLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 font-semibold animate-pulse">
            Verifying room availability…
          </p>
        </div>
      </div>
    );
  }

  if (prebookError) {
    return (
      <main className="flex-grow max-w-xl mx-auto px-4 py-12 bg-[#F0F4F8]">
        <ErrorState title="Rate Verification Failed" message={prebookError} onRetry={runPrebook} />
      </main>
    );
  }

  const isEmailVerified = !!user?.email_confirmed_at;

  return (
    <main className="flex-1 bg-[#F0F4F8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#0F4C81] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/hotels/search" className="hover:text-[#0F4C81] transition-colors">Hotels</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-semibold">Book</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold text-[#0F4C81] hover:underline mb-3"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden />
                Back to results
              </button>
              <h1 className="text-2xl font-black text-gray-900">Confirm Your Stay</h1>
              <p className="text-sm text-gray-500 mt-1">Fill in guest details to complete the reservation.</p>
            </div>

            {!isEmailVerified && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                <MailWarning className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-bold text-red-700">Email Verification Required</p>
                  <p className="text-red-600 text-xs mt-1">Please confirm your email before booking. Check your inbox.</p>
                </div>
              </div>
            )}

            {bookingError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
                <p className="text-red-700 font-medium">{bookingError}</p>
              </div>
            )}

            <GuestDetailsForm
              guestCount={adults}
              onSubmit={handleConfirmBooking}
              isLoading={bookingLoading}
            />
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">
            <div className="ota-card bg-white p-5 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
                <Hotel className="w-4 h-4 text-[#0F4C81]" aria-hidden />
                Stay Details
              </h3>
              <div>
                <p className="font-bold text-gray-800">{prebookData?.name}</p>
                <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#0F4C81]" aria-hidden />
                  <span>{destination}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-semibold text-gray-700">{formatDate(checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-semibold text-gray-700">{formatDate(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms / Guests</span>
                  <span className="font-semibold text-gray-700">
                    {rooms} room, {adults} adult{adults > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Room Selected</p>
                <p className="text-xs font-bold text-gray-700">{prebookData?.roomType}</p>
                <p className="text-[11px] text-gray-400 italic">Includes: {prebookData?.boardType}</p>
              </div>
            </div>
            <PriceSummary price={prebookData?.price} currency={prebookData?.currency} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HotelBookingPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
    }>
      <HotelBookingContent />
    </React.Suspense>
  );
}
