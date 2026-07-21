import Link from 'next/link';
import { Plane, Shield, Phone } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[#0F4C81] text-blue-100 mt-auto" role="contentinfo">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-xl font-black text-white">
              KV<span className="text-orange-400">Trvl</span>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed max-w-xs">
              A sandbox travel booking platform powered by the LiteAPI. Search and confirm flights &amp; hotels securely.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?tab=flights" className="text-blue-200 hover:text-white transition-colors">
                  Search Flights
                </Link>
              </li>
              <li>
                <Link href="/?tab=hotels" className="text-blue-200 hover:text-white transition-colors">
                  Search Hotels
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-blue-200 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal + trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-blue-300 cursor-default">Terms &amp; Conditions</span>
              </li>
              <li>
                <span className="text-blue-300 cursor-default">Privacy Policy</span>
              </li>
            </ul>
            <p className="text-xs text-blue-300/70 mt-3 leading-relaxed">
              Sandbox environment — no real payments are collected.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-300/70">
          <span>© {new Date().getFullYear()} KVTrvl. All rights reserved.</span>
          <span>Nuitee LiteAPI Sandbox Implementation</span>
        </div>
      </div>
    </footer>
  );
}
