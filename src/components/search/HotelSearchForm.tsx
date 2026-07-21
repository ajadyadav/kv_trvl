'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Users, BedDouble } from 'lucide-react';
import { AutosuggestInput } from './AutosuggestInput';
import { Button } from '../ui/Button';
import { buildQueryString, formatDateForApi } from '@/lib/utils';
import { cn } from '@/lib/utils';

const selectCls =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all';

const labelCls =
  'block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider';

export function HotelSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = React.useState('');
  const [cityCode, setCityCode] = React.useState('');
  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [rooms, setRooms] = React.useState(1);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const threeDays = new Date(today);
    threeDays.setDate(today.getDate() + 4);
    setCheckIn(formatDateForApi(tomorrow));
    setCheckOut(formatDateForApi(threeDays));
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (!cityCode || !destination) newErrors.destination = 'Please select a destination from suggestions';
    if (!checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    } else if (new Date(checkIn) < now) {
      newErrors.checkIn = 'Check-in cannot be in the past';
    }
    if (!checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
      newErrors.checkOut = 'Check-out must be after check-in';
    }
    if (adults < 1) newErrors.adults = 'Must have at least 1 adult';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const qs = buildQueryString({ cityCode, destination, checkIn, checkOut, adults, children, rooms });
    router.push(`/hotels/search${qs}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Destination */}
      <AutosuggestInput
        type="cities"
        label="Where are you going?"
        placeholder="Search city (e.g. Paris, Tokyo, Dubai…)"
        onSelect={(city) => {
          setDestination(city.city_name);
          setCityCode(city.liteapi_city_code);
          setErrors((prev) => { const c = { ...prev }; delete c.destination; return c; });
        }}
        error={errors.destination}
        id="hotel-destination"
      />

      {/* Check-in / Check-out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="checkin" className={labelCls}>
            <CalendarDays className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Check-in
          </label>
          <input
            id="checkin"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 text-sm transition-all',
              'border-gray-300 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20',
              errors.checkIn ? 'border-red-400' : ''
            )}
          />
          {errors.checkIn && <span className="block mt-1 text-xs text-red-500 font-medium">{errors.checkIn}</span>}
        </div>
        <div>
          <label htmlFor="checkout" className={labelCls}>
            <CalendarDays className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Check-out
          </label>
          <input
            id="checkout"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 text-sm transition-all',
              'border-gray-300 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20',
              errors.checkOut ? 'border-red-400' : ''
            )}
          />
          {errors.checkOut && <span className="block mt-1 text-xs text-red-500 font-medium">{errors.checkOut}</span>}
        </div>
      </div>

      {/* Guests */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="hotel-adults" className={labelCls}>
            <Users className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Adults
          </label>
          <select id="hotel-adults" value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={selectCls}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="hotel-children" className={labelCls}>Children</label>
          <select id="hotel-children" value={children} onChange={(e) => setChildren(Number(e.target.value))} className={selectCls}>
            {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="hotel-rooms" className={labelCls}>
            <BedDouble className="inline w-3.5 h-3.5 mr-1 mb-0.5" aria-hidden />
            Rooms
          </label>
          <select id="hotel-rooms" value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className={selectCls}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <Button type="submit" isLoading={loading} className="w-full py-3.5 text-base font-bold rounded-xl shadow-md">
        Search Hotels
      </Button>
    </form>
  );
}
