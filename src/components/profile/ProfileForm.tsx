'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '@/lib/validations';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, CheckCircle2 } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    full_name: string | null;
    phone: string | null;
  };
  onSave: (data: { full_name: string; phone: string }) => Promise<void>;
}

export function ProfileForm({ initialData, onSave }: ProfileFormProps) {
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialData.full_name || '',
      phone: initialData.phone || '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setSuccess(false);
    try {
      await onSave(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="ota-card bg-white p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-3 border-b border-gray-100">
          <User className="w-4 h-4 text-[#0F4C81]" aria-hidden />
          Personal Details
        </h3>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
            Profile updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading} className="px-6 py-2.5 font-bold text-sm rounded-lg">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
