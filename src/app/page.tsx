'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Plane, Hotel, ShieldCheck, Headphones, Globe } from 'lucide-react';
import { HotelSearchForm } from '@/components/search/HotelSearchForm';
import { FlightSearchForm } from '@/components/search/FlightSearchForm';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

const TRUST_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Secure Booking',
    desc: 'End-to-end encrypted transactions on a production-grade pipeline.',
  },
  {
    icon: Globe,
    title: 'Wide Selection',
    desc: 'Hotels and flights from LiteAPI\'s global inventory in one search.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Our sandbox team is here to help you test every step of the flow.',
  },
];

function LandingContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'flights' ? 'flights' : 'hotels';
  const [activeTab, setActiveTab] = React.useState<'hotels' | 'flights'>(initialTab);

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'flights' || tabParam === 'hotels') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <main className="flex-1 flex flex-col">
      {/* ── Hero ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F4C81 0%, #1565C0 50%, #1976D2 100%)',
          minHeight: '320px',
        }}
        aria-label="Search hero"
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -left-8 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-28 text-center">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">
            Powered by LiteAPI Sandbox
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Search Flights &amp; Hotels{' '}
            <span className="text-orange-400">in One Place</span>
          </h1>
          <p className="mt-4 text-blue-100 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Real-time rates, sandbox-safe booking. Confirm flight and hotel reservations in seconds — no real money, full production fidelity.
          </p>
        </div>
      </section>

      {/* ── Search Card (overlapping hero) ── */}
      <section className="relative max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-20 z-20 pb-10">
        <div className="ota-card bg-white p-6 md:p-8">
          {/* Tab strip */}
          <div className="flex items-center gap-0 border-b border-gray-200 mb-6">
            {(['flights', 'hotels'] as const).map((tab) => {
              const Icon = tab === 'flights' ? Plane : Hotel;
              const label = tab === 'flights' ? 'Flights' : 'Hotels';
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'relative flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors',
                    active
                      ? 'text-[#0F4C81]'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className={cn('w-4 h-4', tab === 'flights' && '-rotate-45')} aria-hidden />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 tab-underline" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active form */}
          <div key={activeTab} className="animate-in fade-in duration-200">
            {activeTab === 'flights' ? <FlightSearchForm /> : <HotelSearchForm />}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section
        className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12"
        aria-label="Why book with us"
      >
        <h2 className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          Why book with KVTrvl
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_PROPS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 ota-card bg-white"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-[#0F4C81] shrink-0 border border-blue-100">
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function LandingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <LandingContent />
    </React.Suspense>
  );
}
