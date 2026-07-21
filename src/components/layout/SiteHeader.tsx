'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plane, Hotel } from 'lucide-react';
import { UserProfileMenu } from './UserProfileMenu';
import { cn } from '@/lib/utils';

function HeaderTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Determine active tab based on route or query param
  const flightsActive =
    tabParam === 'flights' ||
    pathname.startsWith('/flights');
  const hotelsActive =
    tabParam === 'hotels' ||
    pathname.startsWith('/hotels') ||
    (!flightsActive && pathname === '/');

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
      <Link
        href="/?tab=flights"
        className={cn(
          'relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors',
          flightsActive
            ? 'text-white bg-white/15'
            : 'text-blue-100 hover:text-white hover:bg-white/10'
        )}
      >
        <Plane className="w-4 h-4 -rotate-45" aria-hidden />
        Flights
        {flightsActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-400 rounded-full tab-underline" />
        )}
      </Link>
      <Link
        href="/?tab=hotels"
        className={cn(
          'relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors',
          hotelsActive
            ? 'text-white bg-white/15'
            : 'text-blue-100 hover:text-white hover:bg-white/10'
        )}
      >
        <Hotel className="w-4 h-4" aria-hidden />
        Hotels
        {hotelsActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-400 rounded-full tab-underline" />
        )}
      </Link>
    </nav>
  );
}

function StickyHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-shadow duration-300',
        'bg-[#0F4C81]',
        scrolled ? 'shadow-lg' : ''
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Left: Logo + Nav tabs */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-white select-none"
            aria-label="KVTrvl home"
          >
            KV<span className="text-orange-400">Trvl</span>
          </Link>
          <React.Suspense fallback={null}>
            <HeaderTabs />
          </React.Suspense>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <React.Suspense fallback={
      <div className="h-14 bg-[#0F4C81]" />
    }>
      <StickyHeader />
    </React.Suspense>
  );
}
