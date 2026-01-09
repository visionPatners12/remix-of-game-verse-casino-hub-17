/**
 * Hook for prefetching Polymarket event details on hover
 * Improves perceived performance by loading data before user clicks
 */

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { polymarketDbService } from '../services/api/polymarketDbService';
import { POLYMARKET_QUERY_KEYS } from './queries/queryKeys';

const PREFETCH_DELAY_MS = 150;
const PREFETCH_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const usePrefetchEvent = () => {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());

  /**
   * Prefetch event details with debounce
   * Skips if already prefetched recently
   */
  const prefetch = useCallback((eventId: string) => {
    // Skip if already prefetched
    if (prefetchedRef.current.has(eventId)) {
      return;
    }

    // Cancel any pending prefetch
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the prefetch
    timeoutRef.current = setTimeout(() => {
      // Check if already in cache
      const existingData = queryClient.getQueryData(
        POLYMARKET_QUERY_KEYS.eventById(eventId)
      );
      
      if (existingData) {
        prefetchedRef.current.add(eventId);
        return;
      }

      // Prefetch the event
      queryClient.prefetchQuery({
        queryKey: POLYMARKET_QUERY_KEYS.eventById(eventId),
        queryFn: () => polymarketDbService.fetchEventById(eventId),
        staleTime: PREFETCH_STALE_TIME,
      });

      prefetchedRef.current.add(eventId);

      // Clear from prefetched set after stale time
      setTimeout(() => {
        prefetchedRef.current.delete(eventId);
      }, PREFETCH_STALE_TIME);
    }, PREFETCH_DELAY_MS);
  }, [queryClient]);

  /**
   * Cancel any pending prefetch (useful for cleanup)
   */
  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Clear the prefetched set (force refetch on next hover)
   */
  const clearPrefetchCache = useCallback(() => {
    prefetchedRef.current.clear();
  }, []);

  return {
    prefetch,
    cancelPrefetch,
    clearPrefetchCache,
  };
};
