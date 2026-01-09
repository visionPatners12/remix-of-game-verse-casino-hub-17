import { useInfiniteQuery } from '@tanstack/react-query';
import { useGetStream } from '@/contexts/StreamProvider';
import { StreamService } from '@/services/getstream/streamService';
import { logger } from '@/utils/logger';
import { cacheConfigs } from '@/lib/queryClient';
import { useMemo } from 'react';
import type { StreamActivity } from '@/types/stream';
import { filterValidActivities } from '@/types/stream';

interface UseTimelineFeedOptions {
  userId?: string;
  limit?: number;
  enabled?: boolean;
}

interface UseTimelineFeedResult {
  activities: StreamActivity[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Unified hook for fetching timeline feed with infinite scroll support
 * 
 * Features:
 * - Infinite scroll pagination
 * - Automatic caching with TanStack Query
 * - Optimized for performance
 */
export function useTimelineFeed({
  userId,
  limit = 50,
  enabled = true
}: UseTimelineFeedOptions = {}): UseTimelineFeedResult {
  const { client, isReady } = useGetStream();

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['timeline-feed', userId, limit],
    queryFn: async ({ pageParam }) => {
      // Throw instead of returning empty data to prevent caching empty results
      if (!client || !userId) {
        throw new Error('Stream client not ready');
      }

      logger.debug('[TIMELINE_FEED] Fetching activities', { 
        userId, 
        limit,
        offset: pageParam || 'none'
      });
      const startTime = performance.now();

      const result = await StreamService.getTimelineFeed(client, userId, limit, pageParam);

      const endTime = performance.now();
      logger.debug('[TIMELINE_FEED] Activities fetched', {
        count: result.activities.length,
        hasMore: result.hasMore,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });

      return result;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.activities.length === 0) {
        return undefined;
      }
      // Return the last activity ID for pagination
      return lastPage.activities[lastPage.activities.length - 1].id;
    },
    // Stricter enabled condition to prevent race conditions
    enabled: enabled && isReady === true && client !== null && !!userId,
    staleTime: cacheConfigs.timeline.staleTime,
    gcTime: cacheConfigs.timeline.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false, // Don't retry if client not ready - wait for enabled to change
  });

  // Flatten all pages into single array and validate activities
  const activities = useMemo(() => {
    const rawActivities = data?.pages.flatMap(page => page.activities) || [];
    // Filter and validate activities using type guards
    return filterValidActivities(rawActivities, (msg, data) => {
      logger.warn(msg, data);
    });
  }, [data]);

  return {
    activities,
    isLoading,
    error: error as Error | null,
    refetch,
    fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage
  };
}

