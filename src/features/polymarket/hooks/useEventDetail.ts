import { useQuery } from '@tanstack/react-query';
import { polymarketService } from '../services/api/polymarketApi';
import { transformEventToDetail } from '../utils/eventTransformers';
import { EventDetail } from '@/types/oddsFormat';

export const useEventDetail = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['polymarket-event-detail', eventId],
    queryFn: async (): Promise<EventDetail> => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      
      const result = await polymarketService.fetchEventById(eventId);
      return transformEventToDetail(result.event);
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (event not found)
      if (error?.message?.includes('404') || error?.message?.includes('Failed to fetch event')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};
