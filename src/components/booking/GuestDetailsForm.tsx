'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hotelBookingFormSchema } from '@/lib/validations';
import { HotelBookingFormData } from '@/types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, FileText, ShieldAlert } from 'lucide-react';

interface GuestDetailsFormProps {
  onSubmit: (data: HotelBookingFormData) => void;
  guestCount: number;
  isLoading?: boolean;
}

export function GuestDetailsForm({ onSubmit, guestCount, isLoading }: GuestDetailsFormProps) {
  const defaultGuests = Array.from({ length: guestCount }, () => ({
    firstName: '', lastName: '', email: '', phone: '',
  }));

  const { register, control, handleSubmit, formState: { errors } } = useForm<HotelBookingFormData>({
    resolver: zodResolver(hotelBookingFormSchema),
    defaultValues: { guests: defaultGuests, specialRequests: '' },
  });

  const { fields } = useFieldArray({ control, name: 'guests' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Guest Cards */}
      <div className="space-y-5">
        {fields.map((field, index) => {
          const isPrimary = index === 0;
          return (
            <div key={field.id} className="ota-card bg-white p-6 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
                <User className="w-4 h-4 text-[#0F4C81]" aria-hidden />
                Guest {index + 1}{isPrimary ? ' (Primary Contact)' : ''}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  error={errors.guests?.[index]?.firstName?.message}
                  {...register(`guests.${index}.firstName` as const)}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.guests?.[index]?.lastName?.message}
                  {...register(`guests.${index}.lastName` as const)}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john.doe@example.com"
                  error={errors.guests?.[index]?.email?.message}
                  className="sm:col-span-2"
                  {...register(`guests.${index}.email` as const)}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  error={errors.guests?.[index]?.phone?.message}
                  className="sm:col-span-2"
                  {...register(`guests.${index}.phone` as const)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Requests */}
      <div className="ota-card bg-white p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
          <FileText className="w-4 h-4 text-[#0F4C81]" aria-hidden />
          Special Requests <span className="font-normal text-gray-400">(Optional)</span>
        </h3>
        <textarea
          placeholder="E.g. early check-in, quiet room, twin beds…"
          rows={3}
          {...register('specialRequests')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all resize-none text-sm"
        />
        {errors.specialRequests && (
          <span className="block text-xs text-red-500 font-medium">{errors.specialRequests.message}</span>
        )}
      </div>

      {/* Sandbox notice + CTA */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <p className="text-amber-800 leading-relaxed">
            <span className="font-bold">Simulated Payment:</span> No real money is collected. Confirm to initiate a sandboxed booking through LiteAPI.
          </p>
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base font-bold rounded-xl">
          Confirm Booking
        </Button>
      </div>
    </form>
  );
}
