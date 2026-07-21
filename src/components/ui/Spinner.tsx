import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full p-4" role="status" aria-label="Loading">
      <Loader2
        className={cn(
          'animate-spin text-[#0F4C81]',
          {
            'w-6 h-6': size === 'sm',
            'w-10 h-10': size === 'md',
            'w-16 h-16': size === 'lg',
          },
          className
        )}
      />
    </div>
  );
}
