'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Users, Briefcase, CalendarDays } from 'lucide-react';
import { AutosuggestInput } from './AutosuggestInput';
import { Button } from '../ui/Button';
import { buildQueryString, formatDateForApi } from '@/lib/utils';
import { cn } from '@/lib/utils';

type TripType = 'one-way' | 'round-trip';
type CabinClass = 'economy' | 'business' | 'first';

const selectCls =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all';

const labelCls =
  'block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider';

export function FlightSearchForm() {
  const router = useRouter();

  const [tripType, setTripType] = React.useState<TripType>('one-way');
  const [origin, setOrigin] = React.useState('');
  const [originIata, setOriginIata] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [destinationIata, setDestinationIata] = React.useState('');
  const [departureDate, setDepartureDate] = React.useState('');
  const [returnDate, setReturnDate] = React.useState('');
  const [adults, setAdults] = React.useState(1);
  const [cabinClass, setCabinClass] = React.useState<CabinClass>('economy');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);
    setDepartureDate(formatDateForApi(weekLater));
  }, []);

  /* ── Swap origin ↔ destination ── */
  const handleSwap = () => {
    setOrigin(destination);
    setOriginIata(destinationIata);
    setDestination(origin);
    setDestinationIata(originIata);
  };

  /* ── Validation ── */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (!originIata) newErrors.origin = 'Please select an origin airport';
    if (!destinationIata) newErrors.destination = 'Please select a destination airport';
    else if (originIata === destinationIata) newErrors.destination = 'Origin and destination must differ';

    if (!departureDate) {
      newErrors.departureDate = 'Departure date is required';
    } else if (new Date(departureDate) < now) {
      newErrors.departureDate = 'Departure date cannot be in the past';
    }

    if (tripType === 'round-trip') {
      if (!returnDate) {
        newErrors.returnDate = 'Return date is required for round trips';
      } else if (returnDate && new Date(returnDate) <= new Date(departureDate)) {
        newErrors.returnDate = 'Return must be after departure';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const qs = buildQueryString({
      origin,
      originIata,
      destination,
      destinationIata,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      adults,
      cabinClass,
    });
    router.push(`/flights/search${qs}`);
  };

  const isValid = !!originIata && !!destinationIata && !!departureDate &&
    (tripType === 'one-way' || !!returnDate);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Trip type toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(['one-way', 'round-trip'] as TripType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setTripType(type);
              if (type === 'one-way') setReturnDate('');
            }}
            className={cn(
              'px-4 py-1.5 text-sm font-semibold rounded-md transition-all',
              tripType === type
                ? 'bg-white text-[#0F4C81] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {type === 'one-way' ? 'One Way' : 'Round Trip'}
          </button>
        ))}
      </div>

      {/* From / Swap / To */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <AutosuggestInput
          type="airports"
          label="From"
          placeholder="City or airport"
          defaultValue={origin}
          onSelect={(airport) => {
            setOrigin(`${airport.airport_name} (${airport.iata_code})`);
            setOriginIata(airport.iata_code);
            setErrors((prev) => { const c = { ...prev }; delete c.origin; return c; });
          }}
          error={errors.origin}
          id="flight-origin"
        />

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap origin and destination"
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-blue-50 hover:border-[#0F4C81] text-gray-500 hover:text-[#0F4C81] transition-all self-end mb-px shadow-sm"
        >
          <ArrowLeftRight className="w-4 h-4" aria-hidden />
        </button>

        <AutosuggestInput
          type="airports"
          label="To"
          placeholder="City or airport"
          defaultValue={destination}
          onSelect={(airport) => {
            setDestination(`${airport.airport_name} (${airport.iata_code})`);
            setDestinationIata(airport.iata_code);
            setErrors((prev) => { const c = { ...prev }; delete c.destination; return c; });
          }}
          error={errors.destination}
          id="flight-destination"
        />
      </div>

      {/* Dates row */}
      <div className={cn(
        'grid gap-3',
        tripType === 'round-trip' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-[1fr_1fr]'
      )}>
        <div>
          <label htmlFor="dep-date" className={labelCls}>
            <CalendarDays className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Departure Date
          </label>
          <input
            id="dep-date"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 transition-all text-sm',
              'border-gray-300 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20',
              errors.departureDate ? 'border-red-400' : ''
            )}
          />
          {errors.departureDate && (
            <span className="block mt-1 text-xs text-red-500 font-medium">{errors.departureDate}</span>
          )}
        </div>

        {tripType === 'round-trip' && (
          <div>
            <label htmlFor="ret-date" className={labelCls}>
              <CalendarDays className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
              Return Date
            </label>
            <input
              id="ret-date"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 transition-all text-sm',
                'border-gray-300 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20',
                errors.returnDate ? 'border-red-400' : ''
              )}
            />
            {errors.returnDate && (
              <span className="block mt-1 text-xs text-red-500 font-medium">{errors.returnDate}</span>
            )}
          </div>
        )}
      </div>

      {/* Passengers + Cabin Class */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pax-count" className={labelCls}>
            <Users className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Passengers
          </label>
          <select
            id="pax-count"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className={selectCls}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n} passenger{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cabin-class" className={labelCls}>
            <Briefcase className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Cabin Class
          </label>
          <select
            id="cabin-class"
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as CabinClass)}
            className={selectCls}
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      {/* CTA */}
      <Button
        type="submit"
        isLoading={loading}
        className="w-full py-3.5 text-base font-bold rounded-xl shadow-md"
      >
        Search Flights
      </Button>
    </form>
  );
}
