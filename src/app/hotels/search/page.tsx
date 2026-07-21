'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HotelCard } from '@/components/results/HotelCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { HotelSearchForm } from '@/components/search/HotelSearchForm';
import { Hotel, Calendar, Users, BedDouble, ChevronRight, Pencil, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/* ── Skeleton card ── */
function HotelSkeleton() {
  return (
    <div className="ota-card bg-white overflow-hidden flex flex-col md:flex-row">
      <div className="skeleton w-full md:w-56 h-48 shrink-0" />
      <div className="flex-1 p-5 space-y-3">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-3 w-64 rounded" />
        <div className="flex gap-2 mt-4">
          <div className="skeleton h-7 w-24 rounded-full" />
          <div className="skeleton h-7 w-20 rounded-full" />
        </div>
        <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-8 w-28 rounded" />
          </div>
          <div className="skeleton h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function HotelSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editOpen, setEditOpen] = React.useState(false);

  const cityCode    = searchParams.get('cityCode') || '';
  const destination = searchParams.get('destination') || 'Unknown Destination';
  const checkIn     = searchParams.get('checkIn') || '';
  const checkOut    = searchParams.get('checkOut') || '';
  const adults      = Number(searchParams.get('adults')) || 2;
  const children    = Number(searchParams.get('children')) || 0;
  const rooms       = Number(searchParams.get('rooms')) || 1;

  const [offers, setOffers]   = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  const fetchOffers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityCode, destination, checkIn, checkOut, adults, children, rooms }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to retrieve hotel rates');
      setOffers(json.data || []);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [cityCode, destination, checkIn, checkOut, adults, children, rooms]);

  React.useEffect(() => {
    if (cityCode && checkIn && checkOut) {
      fetchOffers();
    } else {
      setError('Invalid search parameters. Please go back and search again.');
      setLoading(false);
    }
  }, [cityCode, checkIn, checkOut, fetchOffers]);

  const handleSelectOffer = (offer: any) => {
    const query = new URLSearchParams({
      rateId: offer.rateId, checkIn, checkOut,
      adults: String(adults), children: String(children),
      rooms: String(rooms), destination,
    });
    router.push(`/hotels/book/${offer.offerId}?${query.toString()}`);
  };

  return (
    <main className="flex-1 bg-[#F0F4F8]">
      {/* ── Sticky search summary bar ── */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <Hotel className="w-4 h-4 text-[#0F4C81]" aria-hidden />
              <span>{destination}</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {formatDate(checkIn)} — {formatDate(checkOut)}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-gray-600">
              <Users className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {adults} adult{adults > 1 ? 's' : ''}
              {children > 0 && `, ${children} child${children > 1 ? 'ren' : ''}`}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-gray-600">
              <BedDouble className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {rooms} room{rooms > 1 ? 's' : ''}
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

        {editOpen && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 lg:px-8 py-5 max-w-5xl mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <HotelSearchForm />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Hotels in <span className="text-[#0F4C81]">{destination}</span>
          </h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500">{offers.length} propert{offers.length !== 1 ? 'ies' : 'y'} found</p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <HotelSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOffers} />
        ) : offers.length === 0 ? (
          <EmptyState
            title="No hotels found"
            message="No rates were returned for your selection. Try adjusting your dates or destination."
            actionLabel="New Search"
            actionHref="/?tab=hotels"
          />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <HotelCard key={offer.offerId} offer={offer} onSelect={handleSelectOffer} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function HotelSearchPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
    }>
      <HotelSearchContent />
    </React.Suspense>
  );
}
