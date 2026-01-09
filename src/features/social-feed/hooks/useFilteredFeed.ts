import { useMemo } from 'react';
import { useFeedData } from '../context/FeedDataContext';
import type { HybridFeedItem } from '@/types/hybrid-feed';

export type FeedFilterType = 'all' | 'bets' | 'predictions';

interface UseFilteredFeedResult {
  // Filtered feed data
  feed: HybridFeedItem[];
  filteredCount: number;
  totalCount: number;
  
  // Pass-through from context
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Hook that filters the shared feed data locally without making additional API calls.
 * Uses FeedDataContext to access the single source of truth for feed data.
 */
export function useFilteredFeed(filterType: FeedFilterType): UseFilteredFeedResult {
  const {
    feed: fullFeed,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedData();

  // Apply local filtering based on filterType
  const filteredFeed = useMemo(() => {
    if (filterType === 'all') {
      return fullFeed;
    }

    return fullFeed.filter(item => {
      // Only stream posts can be bets or predictions
      if (item.type !== 'stream') {
        return false;
      }

      const postType = item.data.type;

      if (filterType === 'bets') {
        return postType === 'bet';
      }

      if (filterType === 'predictions') {
        return postType === 'prediction';
      }

      return false;
    });
  }, [fullFeed, filterType]);

  return {
    feed: filteredFeed,
    filteredCount: filteredFeed.length,
    totalCount: fullFeed.length,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
