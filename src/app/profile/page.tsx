'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { BookingCard } from '@/components/profile/BookingCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { User, Bookmark, Settings, AlertTriangle, Hotel, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

type Section = 'bookings' | 'profile';
type TypeFilter = 'all' | 'flight' | 'hotel';
type StatusFilter = 'all' | 'confirmed' | 'cancelled';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeSection, setActiveSection] = React.useState<Section>('bookings');
  const [typeFilter, setTypeFilter]       = React.useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter]   = React.useState<StatusFilter>('all');

  const [profile, setProfile]         = React.useState<any | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [profileError, setProfileError]     = React.useState<string | null>(null);

  const [bookings, setBookings]         = React.useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(true);
  const [bookingsError, setBookingsError]     = React.useState<string | null>(null);

  const [cancelModalOpen, setCancelModalOpen]   = React.useState(false);
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);
  const [selectedBookingType, setSelectedBookingType] = React.useState<'hotel' | 'flight' | null>(null);
  const [cancellingLoading, setCancellingLoading] = React.useState(false);
  const [cancellationError, setCancellationError] = React.useState<string | null>(null);

  const fetchProfile = React.useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to retrieve profile.');
      setProfile(json.data);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to fetch profile.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchBookings = React.useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await fetch('/api/bookings');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to retrieve bookings.');
      setBookings(json.data || []);
    } catch (err: any) {
      setBookingsError(err.message || 'Failed to fetch bookings.');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) { fetchProfile(); fetchBookings(); }
  }, [user, fetchProfile, fetchBookings]);

  const handleSaveProfile = async (formData: any) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to save changes.');
    setProfile(json.data);
  };

  const handleCancelClick = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;
    setSelectedBookingId(bookingId);
    setSelectedBookingType(target.booking_type);
    setCancellationError(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId || !selectedBookingType) return;
    setCancellingLoading(true);
    setCancellationError(null);
    const apiPath = selectedBookingType === 'hotel' ? '/api/hotels/cancel' : '/api/flights/cancel';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedBookingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Cancellation was rejected.');
      await fetchBookings();
      setCancelModalOpen(false);
    } catch (err: any) {
      setCancellationError(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancellingLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-[#F0F4F8]">
        <Spinner size="lg" />
      </div>
    );
  }

  /* ── Derived filtered bookings ── */
  const filteredBookings = bookings.filter((b) => {
    const typeOk   = typeFilter === 'all' || b.booking_type === typeFilter;
    const statusOk = statusFilter === 'all' || b.status === statusFilter;
    return typeOk && statusOk;
  });

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveller';
  const userInitial = displayName.charAt(0).toUpperCase();

  const navBtn = (section: Section, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => setActiveSection(section)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left',
        activeSection === section
          ? 'bg-[#0F4C81] text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      {label}
    </button>
  );

  const filterPill = (
    current: string,
    value: string,
    label: string,
    setter: (v: any) => void
  ) => (
    <button
      onClick={() => setter(value)}
      className={cn(
        'px-3 py-1 text-xs font-semibold rounded-full border transition-colors',
        current === value
          ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
          : 'text-gray-600 border-gray-300 hover:border-[#0F4C81] hover:text-[#0F4C81]'
      )}
    >
      {label}
    </button>
  );

  return (
    <main className="flex-1 bg-[#F0F4F8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* ── Left sidebar ── */}
          <aside className="space-y-6">
            {/* Avatar + name */}
            <div className="ota-card bg-white p-5 flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 text-white font-black text-lg select-none">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Nav */}
            <div className="ota-card bg-white p-3 space-y-1">
              {navBtn('bookings', 'My Bookings', Bookmark)}
              {navBtn('profile', 'Profile Settings', Settings)}
            </div>
          </aside>

          {/* ── Right content ── */}
          <div className="space-y-5">
            {activeSection === 'bookings' ? (
              <>
                {/* Heading + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-xl font-black text-gray-900">My Bookings</h1>
                  <div className="flex flex-wrap gap-4">
                    {/* Type filters */}
                    <div className="flex items-center gap-1.5">
                      {filterPill(typeFilter, 'all', 'All', setTypeFilter)}
                      {filterPill(typeFilter, 'flight', '✈ Flights', setTypeFilter)}
                      {filterPill(typeFilter, 'hotel', '🏨 Hotels', setTypeFilter)}
                    </div>
                    {/* Status filters */}
                    <div className="flex items-center gap-1.5">
                      {filterPill(statusFilter, 'all', 'All Status', setStatusFilter)}
                      {filterPill(statusFilter, 'confirmed', 'Confirmed', setStatusFilter)}
                      {filterPill(statusFilter, 'cancelled', 'Cancelled', setStatusFilter)}
                    </div>
                  </div>
                </div>

                {bookingsLoading ? (
                  <Spinner />
                ) : bookingsError ? (
                  <ErrorState message={bookingsError} onRetry={fetchBookings} />
                ) : filteredBookings.length === 0 ? (
                  <EmptyState
                    title="No bookings found"
                    message={
                      bookings.length === 0
                        ? "You haven't made any reservations yet. Search for flights or hotels to get started."
                        : 'No bookings match the selected filters.'
                    }
                    actionLabel={bookings.length === 0 ? 'Search Now' : undefined}
                    actionHref={bookings.length === 0 ? '/' : undefined}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} onCancel={handleCancelClick} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="text-xl font-black text-gray-900">Profile Settings</h1>
                {profileLoading ? (
                  <Spinner />
                ) : profileError ? (
                  <ErrorState message={profileError} onRetry={fetchProfile} />
                ) : (
                  <div className="max-w-lg">
                    <ProfileForm initialData={profile} onSave={handleSaveProfile} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel This Booking?"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancellingLoading}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={cancellingLoading}
            >
              Yes, Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
            <p className="text-amber-800 leading-relaxed font-medium">
              Non-refundable sandbox tickets will fail the cancellation API call. Only confirmed refundable bookings can be cancelled.
            </p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            This is a simulated cancellation. The booking status will be marked as cancelled and a mock refund will be recorded.
          </p>
          {cancellationError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              {cancellationError}
            </p>
          )}
        </div>
      </Modal>
    </main>
  );
}
