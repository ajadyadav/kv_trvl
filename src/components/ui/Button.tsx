import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          {
            // Orange CTA — the OTA action button
            'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm shadow-orange-200':
              variant === 'primary',
            // Blue secondary
            'bg-[#0F4C81] hover:bg-[#1565C0] text-white':
              variant === 'secondary',
            // Light outline
            'bg-white border border-gray-300 hover:border-[#0F4C81] hover:text-[#0F4C81] text-gray-700':
              variant === 'outline',
            // Danger
            'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100':
              variant === 'danger',
            // Ghost
            'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900':
              variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
