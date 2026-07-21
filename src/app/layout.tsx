import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KVTrvl — Search & Book Hotels & Flights',
  description:
    'Search and book real-time hotel rates and global flights in one place. Powered by LiteAPI sandbox.',
  keywords: ['flights', 'hotels', 'travel booking', 'flight search', 'hotel search'],
  openGraph: {
    title: 'KVTrvl — Search & Book Hotels & Flights',
    description: 'Find real-time rates for hotels and global flights in one place.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${outfit.variable} h-full flex flex-col antialiased`}>
        <AuthProvider>
          <SiteHeader />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
