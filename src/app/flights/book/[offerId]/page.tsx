'use client';

import * as React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PassengerDetailsForm } from '@/components/booking/PassengerDetailsForm';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { Spinner } from '@/components/ui/Spinner';
import { generateIdempotencyKey } from '@/lib/utils';
import { ArrowLeft, Plane, ChevronRight, MailWarning, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

function FlightBookingContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const offerId        = params.offerId as string;
  const origin         = searchParams.get('origin') || '';
  const originIata     = searchParams.get('originIata') || '';
  const destination    = searchParams.get('destination') || '';
  const destinationIata = searchParams.get('destinationIata') || '';
  const departureDate  = searchParams.get('departureDate') || '';
  const returnDate     = searchParams.get('returnDate') || '';
  const adults         = Number(searchParams.get('adults')) || 1;
  const cabinClass     = searchParams.get('cabinClass') || 'economy';
  const price          = Number(searchParams.get('price')) || 0;
  const currency       = searchParams.get('currency') || 'USD';
  const airline        = searchParams.get('airline') || '';
  const flightNumber   = searchParams.get('flightNumber') || '';

  const [bookingLoading, setBookingLoading] = React.useState(false);
  const [bookingError, setBookingError]     = React.useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = React.useState('');

  React.useEffect(() => { setIdempotencyKey(generateIdempotencyKey()); }, []);

  const handleConfirmBooking = async (formData: any) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch('/api/flights/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId, idempotencyKey,
          passengers: formData.passengers,
          searchSnapshot: { origin, originIata, destination, destinationIata, departureDate, returnDate: returnDate || null, adults, cabinClass },
          offerSnapshot: { airline, flightNumber, origin: originIata, destination: destinationIata, price, currency, cabinClass, offerId },
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

  if (authLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
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
          <Link href="/flights/search" className="hover:text-[#0F4C81] transition-colors">Flights</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-semibold">Book</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: form area */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold text-[#0F4C81] hover:underline mb-3"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden />
                Back to results
              </button>
              <h1 className="text-2xl font-black text-gray-900">Confirm Your Flight</h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in passenger details below to complete the booking.
              </p>
            </div>

            {!isEmailVerified && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                <MailWarning className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-bold text-red-700">Email Verification Required</p>
                  <p className="text-red-600 text-xs mt-1">
                    Please confirm your email address before making a booking. Check your inbox.
                  </p>
                </div>
              </div>
            )}

            {bookingError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
                <p className="text-red-700 font-medium">{bookingError}</p>
              </div>
            )}

            <PassengerDetailsForm
              passengerCount={adults}
              onSubmit={handleConfirmBooking}
              isLoading={bookingLoading}
            />
          </div>

          {/* Right: sticky sidebar */}
          <div className="space-y-5">
            {/* Flight summary */}
            <div className="ota-card bg-white p-5 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
                <Plane className="w-4 h-4 -rotate-45 text-[#0F4C81]" aria-hidden />
                Flight Summary
              </h3>

              <div>
                <p className="font-bold text-gray-800">{airline}</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">
                  Flight {flightNumber}
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-gray-100 text-sm font-bold text-gray-800">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">From</p>
                  <p className="text-lg">{originIata}</p>
                </div>
                <Plane className="w-4 h-4 -rotate-45 text-orange-400" aria-hidden />
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">To</p>
                  <p className="text-lg">{destinationIata}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Departure</span>
                  <span className="font-semibold text-gray-700">{formatDate(departureDate)}</span>
                </div>
                {returnDate && (
                  <div className="flex justify-between">
                    <span>Return</span>
                    <span className="font-semibold text-gray-700">{formatDate(returnDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Cabin</span>
                  <span className="font-semibold text-gray-700 capitalize">{cabinClass}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passengers</span>
                  <span className="font-semibold text-gray-700">{adults}</span>
                </div>
              </div>
            </div>

            <PriceSummary price={price} currency={currency} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FlightBookingPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
    }>
      <FlightBookingContent />
    </React.Suspense>
  );
}
