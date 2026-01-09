import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { polymarketClient } from '@/integrations/supabase/client';
import type { PolymarketEventSearchResult, PolymarketTagSearchResult, PolymarketSearchRpcResult } from '../types/polymarket';

interface UsePolymarketSearchOptions {
  query: string;
  enabled?: boolean;
  debounceMs?: number;
  pageSize?: number;
}

interface UsePolymarketSearchReturn {
  data: PolymarketEventSearchResult[];
  matchingTags: PolymarketTagSearchResult[];
  tagsCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function usePolymarketSearch({
  query,
  enabled = true,
  debounceMs = 300,
  pageSize = 20
}: UsePolymarketSearchOptions): UsePolymarketSearchReturn {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['polymarket-search', debouncedQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { events: [], tags: [], tagsCount: 0, nextOffset: null };
      }

      // Single RPC call - much more efficient
      const { data: results, error: rpcError } = await (polymarketClient as any).rpc(
        'search_events_by_tag',
        {
          search_term: debouncedQuery.trim(),
          result_limit: pageSize,
          result_offset: pageParam
        }
      );

      if (rpcError) {
        console.error('Error searching polymarket:', rpcError);
        throw new Error(rpcError.message);
      }

      const rpcResults = (results || []) as PolymarketSearchRpcResult[];
      const tagsCount = rpcResults[0]?.total_tags_count || 0;

      // Extract unique tags
      const tagsMap = new Map<string, PolymarketTagSearchResult>();
      const events: PolymarketEventSearchResult[] = [];

      for (const row of rpcResults) {
        if (!tagsMap.has(row.tag_id)) {
          tagsMap.set(row.tag_id, {
            id: row.tag_id,
            label: row.tag_label,
            slug: row.tag_slug
          });
        }
        events.push({
          id: row.event_id,
          title: row.title,
          description: row.description,
          image: row.image,
          icon: row.icon,
          category: row.category,
          volume: row.volume,
          liquidity: row.liquidity,
          end_date: row.end_date,
          active: row.active,
          tag_label: row.tag_label,
          tag_slug: row.tag_slug
        });
      }

      return {
        events,
        tags: Array.from(tagsMap.values()),
        tagsCount,
        nextOffset: events.length === pageSize ? pageParam + pageSize : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 30000,
    gcTime: 60000
  });

  // Aggregate results from all pages
  const allEvents = data?.pages.flatMap(page => page.events) || [];
  const allTags = data?.pages[0]?.tags || [];
  const tagsCount = data?.pages[0]?.tagsCount || 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  const reset = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    data: allEvents,
    matchingTags: allTags,
    tagsCount,
    isLoading: isLoading || isFetching,
    error: error ? (error as Error).message : null,
    hasMore: !!hasNextPage,
    loadMore,
    reset
  };
}
