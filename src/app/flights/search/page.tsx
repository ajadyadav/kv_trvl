'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlightCard } from '@/components/results/FlightCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlightSearchForm } from '@/components/search/FlightSearchForm';
import {
  Plane, Calendar, Users, ChevronRight, Pencil, X, Info,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ── Skeleton card while loading ── */
function FlightSkeleton() {
  return (
    <div className="ota-card bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="skeleton w-9 h-9 rounded-lg" />
        <div className="space-y-1.5">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="px-5 py-5 flex items-center gap-6">
        <div className="space-y-2">
          <div className="skeleton h-8 w-16 rounded" />
          <div className="skeleton h-4 w-10 rounded" />
        </div>
        <div className="flex-1 space-y-2 flex flex-col items-center">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-px w-full rounded" />
          <div className="skeleton h-3 w-14 rounded" />
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <div className="skeleton h-8 w-16 rounded" />
          <div className="skeleton h-4 w-10 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="flex items-center gap-4">
          <div className="skeleton h-8 w-20 rounded" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function FlightSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editOpen, setEditOpen] = React.useState(false);

  const origin       = searchParams.get('origin') || '';
  const originIata   = searchParams.get('originIata') || '';
  const destination  = searchParams.get('destination') || '';
  const destinationIata = searchParams.get('destinationIata') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate    = searchParams.get('returnDate') || '';
  const adults        = Number(searchParams.get('adults')) || 1;
  const cabinClass    = searchParams.get('cabinClass') || 'economy';

  const [offers, setOffers]     = React.useState<any[]>([]);
  const [isFallback, setIsFallback] = React.useState(false);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState<string | null>(null);

  const fetchOffers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin, originIata, destination, destinationIata,
          departureDate, returnDate: returnDate || undefined, adults, cabinClass,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to retrieve flight rates');
      setOffers(json.data || []);
      setIsFallback(!!json.isFallback);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [origin, originIata, destination, destinationIata, departureDate, returnDate, adults, cabinClass]);

  React.useEffect(() => {
    if (originIata && destinationIata && departureDate) {
      fetchOffers();
    } else {
      setError('Invalid search parameters. Please go back and search again.');
      setLoading(false);
    }
  }, [originIata, destinationIata, departureDate, fetchOffers]);

  const handleSelectOffer = (offer: any) => {
    const query = new URLSearchParams({
      origin, originIata, destination, destinationIata,
      departureDate, returnDate, adults: String(adults), cabinClass,
      price: String(offer.price), currency: offer.currency,
      airline: offer.airline, flightNumber: offer.flightNumber,
    });
    router.push(`/flights/book/${offer.offerId}?${query.toString()}`);
  };

  return (
    <main className="flex-1 bg-[#F0F4F8]">
      {/* ── Sticky search summary bar ── */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <Plane className="w-4 h-4 -rotate-45 text-[#0F4C81]" aria-hidden />
              <span>{originIata}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span>{destinationIata}</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {formatDate(departureDate)}
              {returnDate && <span> — {formatDate(returnDate)}</span>}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-gray-600">
              <Users className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {adults} pax · <span className="capitalize">{cabinClass}</span>
            </span>
          </div>
          <button
            onClick={() => setEditOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0F4C81] border border-[#0F4C81]/30 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {editOpen ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editOpen ? 'Close' : 'Edit Search'}
          </button>
        </div>

        {/* Collapsible edit form */}
        {editOpen && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 lg:px-8 py-5 max-w-5xl mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <FlightSearchForm />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {/* Page heading */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Flights from <span className="text-[#0F4C81]">{originIata}</span> to{' '}
            <span className="text-[#0F4C81]">{destinationIata}</span>
          </h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500">{offers.length} result{offers.length !== 1 ? 's' : ''} found</p>
          )}
        </div>

        {/* Sandbox fallback notice */}
        {!loading && !error && isFallback && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-bold text-blue-800">Sandbox Fallback Mode</p>
              <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
                Live flight data requires an enterprise LiteAPI tier. Showing high-fidelity simulated offers for full booking-flow testing.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <FlightSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOffers} />
        ) : offers.length === 0 ? (
          <EmptyState
            title="No flights found"
            message="No routes were found for this combination. Try adjusting your dates or airports."
            actionLabel="New Search"
            actionHref="/?tab=flights"
          />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <FlightCard key={offer.offerId} offer={offer} onSelect={handleSelectOffer} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function FlightSearchPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
    }>
      <FlightSearchContent />
    </React.Suspense>
  );
}
