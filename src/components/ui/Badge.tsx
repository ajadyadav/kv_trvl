import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        {
          'bg-emerald-50 text-emerald-700 border-emerald-200': variant === 'success',
          'bg-amber-50 text-amber-700 border-amber-200': variant === 'warning',
          'bg-red-50 text-red-600 border-red-200': variant === 'error',
          'bg-blue-50 text-blue-700 border-blue-200': variant === 'info',
          'bg-gray-100 text-gray-600 border-gray-200': variant === 'default',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
