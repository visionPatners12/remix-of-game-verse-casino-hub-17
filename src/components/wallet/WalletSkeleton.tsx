import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getCachedWalletState, truncateAddress } from '@/utils/walletSessionCache';

interface WalletSkeletonProps {
  className?: string;
  showCachedAddress?: boolean;
}

/**
 * Optimized wallet skeleton that shows cached address during loading
 * Provides instant visual feedback instead of empty loading state
 */
export function WalletSkeleton({ className, showCachedAddress = true }: WalletSkeletonProps) {
  const cachedState = showCachedAddress ? getCachedWalletState() : null;

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-card border border-border', className)}>
      {/* Avatar skeleton */}
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      
      <div className="flex-1 min-w-0">
        {cachedState ? (
          <>
            {/* Show cached address with syncing indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground/80 truncate">
                {truncateAddress(cachedState.address)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Syncing...
              </span>
            </div>
            <Skeleton className="h-3 w-16 mt-1" />
          </>
        ) : (
          <>
            {/* Standard skeleton when no cache */}
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 mt-1" />
          </>
        )}
      </div>
      
      {/* Action button skeleton */}
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
    </div>
  );
}
