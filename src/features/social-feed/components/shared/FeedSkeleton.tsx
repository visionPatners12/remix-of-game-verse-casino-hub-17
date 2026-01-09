import { cn } from '@/lib/utils';

interface FeedSkeletonProps {
  message?: string;
  count?: number;
}

function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-muted/50 rounded",
      className
    )}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function FeedSkeleton({ message, count = 3 }: FeedSkeletonProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="border-b border-border/50 px-4 py-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Header with avatar and user info */}
          <div className="flex items-start gap-3 mb-4">
            <ShimmerEffect className="w-11 h-11 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <ShimmerEffect className="h-4 w-24 rounded-md" />
                <ShimmerEffect className="h-3 w-16 rounded-md" />
              </div>
              <div className="flex items-center gap-1.5">
                <ShimmerEffect className="h-5 w-14 rounded-full" />
                <ShimmerEffect className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Content area - varies by index for visual interest */}
          <div className="space-y-3 mb-4">
            {i % 3 === 0 ? (
              // Selection card skeleton
              <div className="bg-card/30 rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <ShimmerEffect className="h-4 w-4 rounded" />
                  <ShimmerEffect className="h-3 w-20 rounded" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShimmerEffect className="h-6 w-6 rounded-full" />
                    <ShimmerEffect className="h-4 w-20 rounded" />
                  </div>
                  <ShimmerEffect className="h-3 w-6 rounded" />
                  <div className="flex items-center gap-2">
                    <ShimmerEffect className="h-4 w-20 rounded" />
                    <ShimmerEffect className="h-6 w-6 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <ShimmerEffect className="h-3 w-24 rounded" />
                  <ShimmerEffect className="h-6 w-12 rounded-lg" />
                </div>
              </div>
            ) : i % 3 === 1 ? (
              // Text content skeleton
              <>
                <ShimmerEffect className="h-4 w-full rounded" />
                <ShimmerEffect className="h-4 w-4/5 rounded" />
                <ShimmerEffect className="h-4 w-2/3 rounded" />
              </>
            ) : (
              // Highlight/video skeleton
              <>
                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <ShimmerEffect className="h-8 w-8 rounded-full" />
                    <ShimmerEffect className="h-3 w-16 rounded" />
                  </div>
                  <ShimmerEffect className="h-6 w-16 rounded" />
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <ShimmerEffect className="h-8 w-8 rounded-full" />
                    <ShimmerEffect className="h-3 w-16 rounded" />
                  </div>
                </div>
                <div className="h-48 rounded-lg -mx-4 relative overflow-hidden bg-muted/50" style={{ width: 'calc(100% + 2rem)' }}>
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </>
            )}
          </div>
          
          {/* Reaction bar skeleton */}
          <div className="flex items-center gap-1 pt-3 border-t border-border/40">
            <div className="flex-1 flex items-center justify-center gap-2">
              <ShimmerEffect className="h-5 w-5 rounded" />
              <ShimmerEffect className="h-4 w-6 rounded" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-2">
              <ShimmerEffect className="h-5 w-5 rounded" />
              <ShimmerEffect className="h-4 w-6 rounded" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ShimmerEffect className="h-5 w-5 rounded" />
            </div>
          </div>
        </div>
      ))}
      {message && (
        <div className="text-center text-sm text-muted-foreground/70 py-4 font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
