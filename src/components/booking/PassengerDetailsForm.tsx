'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { flightBookingFormSchema } from '@/lib/validations';
import { FlightBookingFormData } from '@/types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Contact, ShieldAlert } from 'lucide-react';

interface PassengerDetailsFormProps {
  onSubmit: (data: FlightBookingFormData) => void;
  passengerCount: number;
  isLoading?: boolean;
}

export function PassengerDetailsForm({ onSubmit, passengerCount, isLoading }: PassengerDetailsFormProps) {
  const defaultPassengers = Array.from({ length: passengerCount }, () => ({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', passportNumber: '', passportExpiry: '', nationality: '',
  }));

  const { register, control, handleSubmit, formState: { errors } } = useForm<FlightBookingFormData>({
    resolver: zodResolver(flightBookingFormSchema),
    defaultValues: { passengers: defaultPassengers, contactEmail: '', contactPhone: '' },
  });

  const { fields } = useFieldArray({ control, name: 'passengers' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Contact Info */}
      <div className="ota-card bg-white p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
          <Contact className="w-4 h-4 text-[#0F4C81]" aria-hidden />
          Primary Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            placeholder="contact@example.com"
            error={errors.contactEmail?.message}
            {...register('contactEmail')}
          />
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.contactPhone?.message}
            {...register('contactPhone')}
          />
        </div>
      </div>

      {/* Passengers */}
      <div className="space-y-5">
        {fields.map((field, index) => (
          <div key={field.id} className="ota-card bg-white p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
              <User className="w-4 h-4 text-[#0F4C81]" aria-hidden />
              Passenger {index + 1} Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="As in passport"
                error={errors.passengers?.[index]?.firstName?.message}
                {...register(`passengers.${index}.firstName` as const)}
              />
              <Input
                label="Last Name"
                placeholder="As in passport"
                error={errors.passengers?.[index]?.lastName?.message}
                {...register(`passengers.${index}.lastName` as const)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="passenger@example.com"
                error={errors.passengers?.[index]?.email?.message}
                {...register(`passengers.${index}.email` as const)}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                error={errors.passengers?.[index]?.phone?.message}
                {...register(`passengers.${index}.phone` as const)}
              />
              <Input
                label="Date of Birth"
                type="date"
                error={errors.passengers?.[index]?.dateOfBirth?.message}
                {...register(`passengers.${index}.dateOfBirth` as const)}
              />
              <Input
                label="Nationality (2-letter)"
                placeholder="e.g. US, GB, IN"
                maxLength={2}
                error={errors.passengers?.[index]?.nationality?.message}
                {...register(`passengers.${index}.nationality` as const)}
              />
              <Input
                label="Passport Number"
                placeholder="Passport Number"
                error={errors.passengers?.[index]?.passportNumber?.message}
                {...register(`passengers.${index}.passportNumber` as const)}
              />
              <Input
                label="Passport Expiry"
                type="date"
                error={errors.passengers?.[index]?.passportExpiry?.message}
                {...register(`passengers.${index}.passportExpiry` as const)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Sandbox notice + submit */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <p className="text-amber-800 leading-relaxed">
            <span className="font-bold">Simulated Payment:</span> No real money is collected. Clicking confirm initiates a sandbox transaction through LiteAPI. Ensure passport details are valid mock data.
          </p>
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base font-bold rounded-xl">
          Confirm Flight Booking
        </Button>
      </div>
    </form>
  );
}
