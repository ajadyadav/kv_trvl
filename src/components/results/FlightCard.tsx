import * as React from 'react';
import { Plane, Clock, Luggage, CheckCircle2, XCircle } from 'lucide-react';
import { FlightOffer } from '@/types';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface FlightCardProps {
  offer: FlightOffer;
  onSelect: (offer: FlightOffer) => void;
  isLoading?: boolean;
}

function getFlightTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function FlightCard({ offer, onSelect, isLoading }: FlightCardProps) {
  return (
    <div className="ota-card bg-white overflow-hidden transition-shadow hover:shadow-lg group">
      {/* Airline header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 border border-blue-100">
            <Plane className="w-4 h-4 -rotate-45 text-[#0F4C81]" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{offer.airline}</p>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {offer.airlineCode} {offer.flightNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-full capitalize">
            {offer.cabinClass}
          </span>
          {offer.refundable ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
              <CheckCircle2 className="w-3 h-3" aria-hidden />
              Refundable
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full">
              <XCircle className="w-3 h-3" aria-hidden />
              Non-refundable
            </span>
          )}
        </div>
      </div>

      {/* Flight timeline */}
      <div className="px-5 py-5 flex flex-col md:flex-row items-center gap-6">
        {/* Departure */}
        <div className="text-center md:text-left min-w-[80px]">
          <p className="text-3xl font-black text-gray-900 tabular-nums leading-none">
            {getFlightTime(offer.departureTime)}
          </p>
          <p className="text-lg font-bold text-[#0F4C81] mt-1">{offer.origin}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(offer.departureTime, 'MMM d')}</p>
        </div>

        {/* Duration / route line */}
        <div className="flex flex-col items-center flex-1 gap-1 w-full max-w-[220px]">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {offer.duration}
          </div>
          <div className="relative w-full flex items-center">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400 bg-white shrink-0" />
            <div className="flex-1 h-px bg-gray-300 mx-1" />
            <Plane className="w-4 h-4 -rotate-45 text-orange-500 shrink-0" aria-hidden />
            <div className="flex-1 h-px bg-gray-300 mx-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0F4C81] shrink-0" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {offer.stops === 0 ? 'Non-stop' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Arrival */}
        <div className="text-center md:text-right min-w-[80px]">
          <p className="text-3xl font-black text-gray-900 tabular-nums leading-none">
            {getFlightTime(offer.arrivalTime)}
          </p>
          <p className="text-lg font-bold text-[#0F4C81] mt-1">{offer.destination}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(offer.arrivalTime, 'MMM d')}</p>
        </div>
      </div>

      {/* Footer: baggage + price + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Luggage className="w-3.5 h-3.5 text-gray-400" aria-hidden />
          <span>Baggage: <span className="font-semibold text-gray-700">{offer.baggageAllowance}</span></span>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Total fare</p>
            <p className="text-2xl font-black text-gray-900 tabular-nums leading-tight">
              {formatCurrency(offer.price, offer.currency)}
            </p>
          </div>
          <Button
            onClick={() => onSelect(offer)}
            isLoading={isLoading}
            className="px-6 py-2.5 font-bold text-sm rounded-lg"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
