import * as React from 'react';
import { Star, MapPin, BedDouble, Utensils, ShieldCheck } from 'lucide-react';
import { HotelOffer } from '@/types';
import { Button } from '../ui/Button';
import { formatCurrency } from '@/lib/utils';

interface HotelCardProps {
  offer: HotelOffer;
  onSelect: (offer: HotelOffer) => void;
  isLoading?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} star hotel`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function HotelCard({ offer, onSelect, isLoading }: HotelCardProps) {
  return (
    <div className="ota-card bg-white overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-lg group">
      {/* Thumbnail */}
      <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 bg-gray-100 overflow-hidden">
        <img
          src={offer.thumbnail}
          alt={offer.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {offer.refundable && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-white/90 border border-emerald-200 rounded-md backdrop-blur-sm">
            <ShieldCheck className="w-3 h-3" aria-hidden />
            Free Cancellation
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-5">
        <div>
          {/* Name + stars */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0F4C81] transition-colors leading-snug">
                {offer.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={offer.starRating} />
                <span className="text-xs text-gray-400 font-medium">{offer.starRating}-star hotel</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#0F4C81] shrink-0 mt-0.5" aria-hidden />
            <span>{offer.address}, {offer.city}</span>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
              <BedDouble className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {offer.roomType}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
              <Utensils className="w-3.5 h-3.5 text-gray-400" aria-hidden />
              {offer.boardType}
            </span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-4 mt-5 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium">Price per night</p>
            <p className="text-2xl font-black text-gray-900 tabular-nums leading-tight">
              {formatCurrency(offer.price, offer.currency)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">incl. taxes &amp; fees</p>
          </div>
          <Button
            onClick={() => onSelect(offer)}
            isLoading={isLoading}
            className="px-6 py-2.5 font-bold text-sm rounded-lg shrink-0"
          >
            Select Room
          </Button>
        </div>
      </div>
    </div>
  );
}
