import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MainNavigation } from '../common/MainNavigation';
import { FeedContent } from '../common/FeedContent';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';
import { useFullscreen } from '@/contexts/FullscreenContext';
import type { FeedFilter } from '@/types/feed/state';

interface MobileFeedLayoutProps {
  selectedFilter: FeedFilter;
  onFilterSelect: (filter: FeedFilter) => void;
}

export function MobileFeedLayout({ selectedFilter, onFilterSelect }: MobileFeedLayoutProps) {
  const queryClient = useQueryClient();
  const { isFullscreen } = useFullscreen();

  const handleRefresh = useCallback(async () => {
    // Invalidate feed-related queries to trigger a refresh
    await queryClient.invalidateQueries({ queryKey: ['timeline-feed'] });
    await queryClient.invalidateQueries({ queryKey: ['hybrid-feed'] });
    await queryClient.invalidateQueries({ queryKey: ['highlights'] });
  }, [queryClient]);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-background overflow-y-auto hide-scrollbar"
    >
      {/* Mobile navigation at top - hidden in fullscreen mode */}
      {!isFullscreen && (
        <MainNavigation 
          selected={selectedFilter}
          onSelect={onFilterSelect}
          variant="mobile"
        />
      )}
      
      {/* Pull to refresh indicator - hidden in fullscreen mode */}
      {!isFullscreen && (
        <PullToRefreshIndicator 
          pullDistance={pullDistance} 
          isRefreshing={isRefreshing} 
        />
      )}
      
      {/* Filtered feed content with padding to compensate for fixed sub-navbar */}
      <div className={isFullscreen ? "" : "pt-12"}>
        <FeedContent filter={selectedFilter} />
      </div>
    </div>
  );
}
