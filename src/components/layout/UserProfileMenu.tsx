'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { User, LogOut, Bookmark, ChevronDown, Loader2 } from 'lucide-react';

export function UserProfileMenu() {
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-blue-200" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-1.5 text-sm font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-3.5 py-1.5 text-sm font-bold text-[#0F4C81] bg-white rounded-md hover:bg-blue-50 transition-colors"
        >
          Register
        </Link>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Traveller';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="user-menu-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-white hover:bg-white/10 transition-colors"
      >
        {/* Avatar */}
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-400 text-white font-bold text-xs select-none">
          {userInitial}
        </span>
        <span className="hidden md:block text-sm font-semibold max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-blue-200 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdownOpen && (
        <div
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] transition-colors"
            >
              <User className="w-4 h-4" aria-hidden />
              My Profile
            </Link>
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] transition-colors"
            >
              <Bookmark className="w-4 h-4" aria-hidden />
              My Bookings
            </Link>
          </div>

          <div className="py-1 border-t border-gray-100">
            <button
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
