import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays } from 'date-fns';

// ─── Class Name Utility ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Idempotency Key ─────────────────────────────────────────────────────────
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getNightCount(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn));
}

// ─── Currency Formatting ──────────────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'pending':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'cancelled':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'failed':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

// ─── String Helpers ───────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '…';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}

// ─── URL helpers ──────────────────────────────────────────────────────────────
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      qs.append(key, String(val));
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// ─── Sleep ────────────────────────────────────────────────────────────────────
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
