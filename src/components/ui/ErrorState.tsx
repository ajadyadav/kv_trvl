import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center ota-card bg-red-50 border border-red-100">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-500 mb-4 border border-red-200">
        <AlertTriangle className="w-6 h-6" aria-hidden />
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
      <p className="max-w-md text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" aria-hidden />
          Try Again
        </Button>
      )}
    </div>
  );
}
