import { useQuery } from '@tanstack/react-query';
import { useGetStream } from '@/contexts/StreamProvider';
import { cacheConfigs } from '@/lib/queryClient';
import { logger } from '@/utils/logger';

interface UsePremiumTipsFeedOptions {
  userId?: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch premium tips feed from GetStream
 * Reads from the premium_tips feed instead of timeline
 */
export function usePremiumTipsFeed({
  userId,
  limit = 50,
  enabled = true
}: UsePremiumTipsFeedOptions = {}) {
  const { client, isReady } = useGetStream();

  const {
    data: activities = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['premium-tips-feed', userId, limit],
    queryFn: async () => {
      if (!client || !userId) {
        logger.warn('[PREMIUM_TIPS_FEED] Client or userId not available');
        return [];
      }

      logger.debug('[PREMIUM_TIPS_FEED] Fetching activities', { userId, limit });
      const startTime = performance.now();

      const feed = client.feed('premium_tips', userId);
      const response = await feed.get({ 
        limit,
        withRecentReactions: true,
        withReactionCounts: true,
      });

      const endTime = performance.now();
      logger.debug('[PREMIUM_TIPS_FEED] Activities fetched', {
        count: response.results?.length || 0,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });

      // Force isPremium: true for all activities from premium_tips feed
      return (response.results || []).map(activity => ({
        ...activity,
        isPremium: true
      }));
    },
    enabled: enabled && isReady && !!client && !!userId,
    staleTime: cacheConfigs.bets.staleTime,
    gcTime: cacheConfigs.bets.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    activities,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
