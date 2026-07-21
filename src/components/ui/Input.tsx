import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder-gray-400 transition-all',
            'border-gray-300 focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20',
            'disabled:opacity-50 disabled:bg-gray-50',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : '',
            className
          )}
          {...props}
        />
        {error && (
          <span className="block mt-1 text-xs text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
