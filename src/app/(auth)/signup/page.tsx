'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle2, Plane, ArrowRight } from 'lucide-react';

function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/';

  const [error, setError]                 = React.useState<string | null>(null);
  const [success, setSuccess]             = React.useState(false);
  const [loading, setLoading]             = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      });
      if (error) {
        if (error.message.includes('identity') || error.message.includes('provider')) {
          setError('This email already has an account. Please sign in instead.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'OAuth authentication failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #1976D2 100%)' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand strip */}
        <div className="bg-[#0F4C81] px-8 py-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-white" aria-label="KVTrvl home">
            <Plane className="w-6 h-6 -rotate-45 text-orange-400" aria-hidden />
            KV<span className="text-orange-400">Trvl</span>
          </Link>
          <p className="text-blue-200 text-sm mt-2">Create a free account to start booking</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-7 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Account Created!</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                A verification link has been sent to your email. Please verify to enable bookings.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F4C81] hover:underline"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Button type="submit" isLoading={loading} className="w-full py-3 font-bold">
                  Create Account
                </Button>
              </form>

              <div className="relative flex items-center gap-3">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0">or</span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>

              <Button
                onClick={handleGoogleLogin}
                isLoading={googleLoading}
                variant="outline"
                className="w-full py-2.5 font-semibold text-sm gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Sign Up with Google
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link
                  href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                  className="text-[#0F4C81] font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0F4C81]">
        <Spinner />
      </div>
    }>
      <SignupForm />
    </React.Suspense>
  );
}
