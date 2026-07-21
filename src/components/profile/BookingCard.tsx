'use client';

import * as React from 'react';
import { Booking } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Hotel, Plane, Calendar, MapPin, Trash2 } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  isCancelling?: boolean;
}

export function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  const isHotel = booking.booking_type === 'hotel';
  const offer   = booking.offer_snapshot;
  const title   = isHotel
    ? (offer.name as string)
    : `${offer.airline} · ${offer.origin} → ${offer.destination}`;
  const subtitle = isHotel ? (offer.address as string) : `Flight ${offer.flightNumber}`;

  return (
    <div className="ota-card bg-white overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100">
            {isHotel
              ? <Hotel className="w-4 h-4 text-[#0F4C81]" aria-hidden />
              : <Plane className="w-4 h-4 -rotate-45 text-[#0F4C81]" aria-hidden />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-snug">{title}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Ref: {booking.liteapi_booking_id || 'Pending'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(booking.status)}>
            {getStatusLabel(booking.status)}
          </Badge>
          {booking.payment_status === 'refunded' && (
            <Badge variant="info">Refunded</Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden />
            {isHotel ? (
              <span>
                {formatDate(booking.check_in!)} — {formatDate(booking.check_out!)}
              </span>
            ) : (
              <span>
                {formatDate(booking.departure_date!)}
                {booking.return_date ? ` — ${formatDate(booking.return_date)}` : ''}
              </span>
            )}
          </div>
          {isHotel && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-[#0F4C81]/60 shrink-0" aria-hidden />
              <span>{subtitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase md:text-right">Total</p>
            <p className="text-lg font-black text-gray-900 tabular-nums">
              {formatCurrency(booking.total_price, booking.currency)}
            </p>
          </div>
          {booking.status === 'confirmed' && (
            <Button
              onClick={() => onCancel(booking.id)}
              isLoading={isCancelling}
              variant="danger"
              size="sm"
              className="gap-1.5 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
