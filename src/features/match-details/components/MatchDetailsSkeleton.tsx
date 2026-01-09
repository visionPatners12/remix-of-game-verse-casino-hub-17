import React, { memo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MatchDetailsSkeletonProps {
  variant?: 'stats' | 'lineup' | 'boxscore' | 'feed' | 'default';
  className?: string;
}

export const MatchDetailsSkeleton = memo(function MatchDetailsSkeleton({ 
  variant = 'default',
  className 
}: MatchDetailsSkeletonProps) {
  if (variant === 'stats') {
    return (
      <div className={cn("space-y-6 p-4", className)}>
        {/* Team headers skeleton */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Stat bars skeleton */}
        <div className="space-y-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'lineup') {
    return (
      <div className={cn("space-y-6 p-4", className)}>
        {/* Field skeleton */}
        <Skeleton className="w-full aspect-[2/3] rounded-lg" />
        
        {/* Substitutes skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'boxscore') {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        {/* Category tabs skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Player cards skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'feed') {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 border border-border rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="relative">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <Skeleton className="h-4 w-32 mt-4" />
    </div>
  );
});

// Inline loading state component for smaller sections
export const InlineLoadingSkeleton = memo(function InlineLoadingSkeleton({ 
  rows = 3,
  className 
}: { 
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
});
