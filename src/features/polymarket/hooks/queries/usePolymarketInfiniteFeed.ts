import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { polymarketDbService } from '../../services/api/polymarketDbService';
import { PolymarketTab } from '../../types/feed';
import { POLYMARKET_QUERY_KEYS } from './queryKeys';

const PAGE_SIZE = 15; // Reduced for faster initial load

interface UseInfiniteFeedOptions {
  tab?: PolymarketTab;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
}

export const usePolymarketInfiniteFeed = (options: UseInfiniteFeedOptions = {}) => {
  const { tab = 'trending', categorySlug, subcategorySlug } = options;

  return useInfiniteQuery({
    queryKey: POLYMARKET_QUERY_KEYS.infiniteFeed(tab, categorySlug, subcategorySlug),
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_SIZE;
      
      let result;
      if (categorySlug) {
        const category = await polymarketDbService.getCategoryBySlug(categorySlug);
        if (!category) {
          result = await polymarketDbService.fetchEventsByTab('trending', PAGE_SIZE, offset);
        } else {
          const categoryTagId = category.tag_id;

          if (subcategorySlug) {
            // subcategorySlug is now the subcategory tag_id directly
            result = await polymarketDbService.fetchEventsBySubcategory(
              categoryTagId, 
              subcategorySlug, 
              { limit: PAGE_SIZE, offset }
            );
          } else {
            result = await polymarketDbService.fetchEventsByCategory(categoryTagId, { limit: PAGE_SIZE, offset });
          }
        }
      } else {
        result = await polymarketDbService.fetchEventsByTab(tab, PAGE_SIZE, offset);
      }
      
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

