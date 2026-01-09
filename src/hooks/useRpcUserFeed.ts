import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { transformRpcItemsToFeed } from '@/features/feed/utils/rpcTransformers';
import type { RpcUserFeedItem, RpcUserFeedCursor, RpcMatchData, RpcHighlightData } from '@/features/feed/types/rpcUserFeed';
import type { HybridFeedItem } from '@/types/hybrid-feed';

interface UseRpcUserFeedOptions {
  limit?: number;
  highlightFirst?: boolean;
  enabled?: boolean;
}

interface UseRpcUserFeedResult {
  feed: HybridFeedItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Hook to fetch personalized feed using rpc_user_feed
 * Returns matches and highlights based on user preferences
 */
export function useRpcUserFeed(options: UseRpcUserFeedOptions = {}): UseRpcUserFeedResult {
  const { user } = useAuth();
  // INCREASED default limit from 20 to 50
  const { limit = 50, highlightFirst = true, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey: ['rpc-user-feed', user?.id, limit, highlightFirst],
    queryFn: async ({ pageParam }: { pageParam: RpcUserFeedCursor | undefined }) => {
      console.log('[useRpcUserFeed] Fetching with:', {
        limit,
        cursor: pageParam,
        highlightFirst
      });

      const { data, error } = await supabase.rpc('rpc_user_feed', {
        p_user_id: user?.id || null,
        p_limit: limit,
        p_cursor_rn: pageParam?.rn || null,
        p_cursor_type: pageParam?.type || null,
        p_cursor_id: pageParam?.id || null,
        p_highlight_first: highlightFirst,
      });

      if (error) {
        console.error('[useRpcUserFeed] RPC error:', error);
        throw error;
      }

      // Parse the raw response - data field is JSON that needs type assertion
      const rawItems = data || [];
      const items: RpcUserFeedItem[] = rawItems.map((item: {
        item_type: string;
        item_id: string;
        rn: number;
        ts: string;
        sport_id: string;
        league_id: string;
        home_team_id: string;
        away_team_id: string;
        pref_id: string;
        pref_entity_type: 'sport' | 'league' | 'team' | 'player';
        pref_position: number;
        data: unknown;
      }) => ({
        item_type: item.item_type as 'match' | 'highlight',
        item_id: item.item_id,
        rn: item.rn,
        ts: item.ts,
        sport_id: item.sport_id,
        league_id: item.league_id,
        home_team_id: item.home_team_id,
        away_team_id: item.away_team_id,
        pref_id: item.pref_id,
        pref_entity_type: item.pref_entity_type,
        pref_position: item.pref_position,
        data: item.data as RpcMatchData | RpcHighlightData
      }));
      
      // Transform to HybridFeedItem format
      const feedItems = transformRpcItemsToFeed(items);

      // Build cursor for next page - FIXED: allow next page if we got ANY items
      const lastItem = items[items.length - 1];
      const nextCursor: RpcUserFeedCursor | undefined = items.length > 0 && lastItem
        ? {
            rn: lastItem.rn,
            type: lastItem.item_type,
            id: lastItem.item_id
          }
        : undefined;

      console.log('[useRpcUserFeed] Response:', {
        itemCount: items.length,
        feedItemsCount: feedItems.length,
        hasNextCursor: !!nextCursor,
        lastRn: lastItem?.rn
      });

      return { feedItems, nextCursor, rawCount: items.length };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as RpcUserFeedCursor | undefined,
    enabled: enabled && !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single feed array
  const feed = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap(page => page.feedItems);
  }, [query.data?.pages]);

  return {
    feed,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
