import { useQuery } from '@tanstack/react-query';
import { polymarketService } from '../../services/api/polymarketApi';
import { cacheConfigs } from '@/lib/queryClient';
import { POLYMARKET_QUERY_KEYS } from '../../constants/queryKeys';
import { PolymarketEvent } from '../../types/events';

export const usePolymarketEvents = (category: string | null) => {
  return useQuery({
    queryKey: POLYMARKET_QUERY_KEYS.events(category),
    queryFn: async () => {
      if (category) {
        const response = await polymarketService.fetchEventsByCategory(category);
        return response.data;
      }
      return polymarketService.fetchAllEvents();
    },
    staleTime: cacheConfigs.featured.staleTime,
    gcTime: cacheConfigs.featured.gcTime,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: POLYMARKET_QUERY_KEYS.featuredEvents(),
    queryFn: async () => {
      const response = await polymarketService.fetchEventsByTab('trending', 20);
      return response.data;
    },
    staleTime: cacheConfigs.featured.staleTime,
    gcTime: cacheConfigs.featured.gcTime,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Extended event type with CLOB prices - compatible with EnrichedPolymarketEvent
export interface PolymarketEventWithPrices extends PolymarketEvent {
  _clobPrices: Record<string, string | number> | null;
  likes_count?: number;
  comments_count?: number;
}

export const usePolymarketEventById = (eventId: string | undefined) => {
  return useQuery({
    queryKey: POLYMARKET_QUERY_KEYS.eventById(eventId),
    queryFn: async (): Promise<PolymarketEventWithPrices> => {
      if (!eventId) throw new Error('Event ID is required');
      
      const result = await polymarketService.fetchEventById(eventId);
      
      // Attach CLOB prices to the event for template consumption
      return {
        ...result.event,
        _clobPrices: result.clobPrices
      };
    },
    enabled: !!eventId,
    staleTime: cacheConfigs.featured.staleTime,
    gcTime: cacheConfigs.featured.gcTime,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
