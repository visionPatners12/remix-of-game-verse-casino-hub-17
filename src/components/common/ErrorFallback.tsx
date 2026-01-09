import React from 'react';
import { Button } from '@/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FeedError } from '@/types/feed';

interface ErrorFallbackProps {
  error?: FeedError | Error | null;
  onRetry?: () => void;
  variant?: 'compact' | 'full';
}

/**
 * Reusable error fallback component for feed errors
 * Shows appropriate error messages and retry options
 */
export function ErrorFallback({ 
  error, 
  onRetry, 
  variant = 'full' 
}: ErrorFallbackProps) {
  if (!error) return null;

  const isCompact = variant === 'compact';
  
  const getErrorMessage = () => {
    if ('type' in error) {
      switch (error.type) {
        case 'NETWORK':
          return 'Connection problem. Please check your internet.';
        case 'AUTH':
          return 'Authentication required. Please sign in.';
        case 'VALIDATION':
          return 'Invalid data received. Please try again.';
        default:
          return error.message || 'An unexpected error occurred';
      }
    }
    return error.message || 'Something went wrong';
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive flex-1">{getErrorMessage()}</span>
        {onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-auto p-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <h3 className="font-medium mb-2">Unable to load content</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {getErrorMessage()}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}