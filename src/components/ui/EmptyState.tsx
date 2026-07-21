import { Search } from 'lucide-react';
import Link from 'next/link';

export interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = 'No results found',
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center ota-card bg-white">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-[#0F4C81] mb-4 border border-blue-100">
        <Search className="w-6 h-6" aria-hidden />
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
      <p className="max-w-xs text-sm text-gray-500 leading-relaxed">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
