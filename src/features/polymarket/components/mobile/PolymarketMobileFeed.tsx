import React, { memo, useRef, useEffect } from 'react';
import { PolymarketEvent } from '../../types/events';
import { PolymarketMobileCard } from './PolymarketMobileCard';
import { MarketCardCallbacks } from '../../types/ui';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PolymarketMobileFeedProps extends MarketCardCallbacks {
  events: PolymarketEvent[];
  isLoading?: boolean;
  error?: Error | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export const PolymarketMobileFeed: React.FC<PolymarketMobileFeedProps> = memo(({
  events,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onView,
  onOpenDetails
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[MobileFeed] Setting up IntersectionObserver', { hasNextPage, isFetchingNextPage, eventsCount: events.length });
    
    if (!loadMoreRef.current || !hasNextPage || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        console.log('[MobileFeed] Intersection:', entries[0].isIntersecting, { isFetchingNextPage });
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          console.log('[MobileFeed] Triggering loadMore');
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, events.length]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Error loading markets: {error.message}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No markets available for this category</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {events.map((event) => (
        <PolymarketMobileCard
          key={event.id}
          event={event}
          onView={onView}
          onOpenDetails={onOpenDetails}
        />
      ))}
      
      {/* Sentinel for infinite scroll */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage && <LoadingSpinner />}
        {!hasNextPage && events.length > 0 && (
          <p className="text-muted-foreground text-sm">End of markets</p>
        )}
      </div>
    </div>
  );
});
