import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const opacity = Math.min(progress * 1.5, 1);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all duration-200"
      style={{ height: pullDistance }}
    >
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full bg-primary/10",
          isRefreshing && "animate-spin"
        )}
        style={{
          opacity,
          transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
        }}
      >
        <RefreshCw className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
}
