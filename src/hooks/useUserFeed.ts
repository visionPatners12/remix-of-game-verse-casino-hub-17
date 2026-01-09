import { useInfiniteQuery } from '@tanstack/react-query';
import { useGetStream } from '@/contexts/StreamProvider';
import { StreamService } from '@/services/getstream/streamService';
import { logger } from '@/utils/logger';
import { cacheConfigs } from '@/lib/queryClient';
import { useMemo } from 'react';

interface UseUserFeedOptions {
  userId?: string;
  limit?: number;
  enabled?: boolean;
}

interface UseUserFeedResult {
  activities: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Hook for fetching user feed - posts created BY a specific user
 * Uses TanStack Query infinite query for pagination
 */
export function useUserFeed({
  userId,
  limit = 25,
  enabled = true
}: UseUserFeedOptions = {}): UseUserFeedResult {
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
    queryKey: ['user-feed', userId, limit],
    queryFn: async ({ pageParam }) => {
      if (!client || !userId) {
        logger.warn('[USER_FEED] Client or userId not available');
        return { results: [], next: undefined };
      }

      logger.debug('[USER_FEED] Fetching user activities', { userId, limit, cursor: pageParam });
      const startTime = performance.now();

      const response = await StreamService.getUserFeed(client, userId, limit, pageParam);

      const endTime = performance.now();
      logger.debug('[USER_FEED] Activities fetched', {
        userId,
        count: response.results.length,
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        hasMore: !!response.next
      });

      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.next,
    enabled: enabled && isReady && !!client && !!userId,
    staleTime: cacheConfigs.bets.staleTime,
    gcTime: cacheConfigs.bets.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Flatten all pages into single activities array
  const activities = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.results);
  }, [data]);

  return {
    activities,
    isLoading,
    error: error as Error | null,
    refetch,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage
  };
}
