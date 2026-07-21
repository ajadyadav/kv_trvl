'use client';

import * as React from 'react';
import { Search, MapPin, Plane, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AutosuggestInputProps {
  label?: string;
  placeholder?: string;
  type: 'cities' | 'airports';
  onSelect: (item: any) => void;
  defaultValue?: string;
  error?: string;
  icon?: React.ReactNode;
  id?: string;
}

export function AutosuggestInput({
  label,
  placeholder = 'Search destinations...',
  type,
  onSelect,
  defaultValue = '',
  error,
  icon,
  id,
}: AutosuggestInputProps) {
  const [query, setQuery] = React.useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = React.useState(defaultValue);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  React.useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/autosuggest/${type}?q=${encodeURIComponent(debouncedQuery)}`);
        const json = await res.json();
        if (json.data) setSuggestions(json.data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, type]);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const defaultIcon = type === 'airports'
    ? <Plane className="w-4 h-4 -rotate-45" />
    : <MapPin className="w-4 h-4" />;

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder-gray-400 transition-all',
            'border-gray-300 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
          )}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-[#0F4C81]" />
            : (icon ?? defaultIcon)
          }
        </div>
      </div>

      {error && <span className="block mt-1 text-xs text-red-500 font-medium">{error}</span>}

      {/* Suggestions Dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 w-full mt-1.5 overflow-hidden border bg-white border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((item, idx) => {
            const isCity = type === 'cities';
            const displayTitle = isCity
              ? item.city_name
              : `${item.airport_name} (${item.iata_code})`;
            const displaySub = isCity
              ? item.country_code
              : `${item.city || ''}, ${item.country || ''}`;

            return (
              <li
                key={idx}
                role="option"
                onClick={() => {
                  onSelect(item);
                  setQuery(displayTitle);
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors text-gray-700 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-[#0F4C81] shrink-0">
                  {type === 'airports'
                    ? <Plane className="w-4 h-4 -rotate-45" />
                    : <MapPin className="w-4 h-4" />
                  }
                </span>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-gray-800 truncate">{displayTitle}</div>
                  <div className="text-xs text-gray-400 truncate">{displaySub}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
