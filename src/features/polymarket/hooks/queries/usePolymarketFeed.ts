import { useQuery } from '@tanstack/react-query';
import { polymarketDbService } from '../../services/api/polymarketDbService';
import { cacheConfigs } from '@/lib/queryClient';
import { PolymarketTab } from '../../types/feed';

interface UseFeedOptions {
  tab?: PolymarketTab;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  limit?: number;
  offset?: number;
}

export const usePolymarketFeed = (options: UseFeedOptions = {}) => {
  const { 
    tab = 'trending', 
    categorySlug, 
    subcategorySlug, 
    limit = 40, 
    offset = 0 
  } = options;

  return useQuery({
    queryKey: ['polymarket-feed', tab, categorySlug, subcategorySlug, limit, offset],
    queryFn: async () => {
      // Si catégorie sélectionnée, résoudre le slug en tag_id
      if (categorySlug) {
        const category = await polymarketDbService.getCategoryBySlug(categorySlug);
        
        if (!category) {
          // Catégorie inconnue, fallback sur trending
          return polymarketDbService.fetchEventsByTab('trending', limit, offset);
        }

        const categoryTagId = category.tag_id;

        // Si sous-catégorie sélectionnée
        if (subcategorySlug) {
          const subcategories = await polymarketDbService.fetchSubcategories(categoryTagId);
          const subcategory = subcategories.find(s => s.slug === subcategorySlug);
          
          if (subcategory) {
            return polymarketDbService.fetchEventsBySubcategory(
              categoryTagId, 
              subcategory.id, 
              { limit, offset }
            );
          }
        }
        
        // Catégorie sans sous-catégorie
        return polymarketDbService.fetchEventsByCategory(categoryTagId, { limit, offset });
      }
      
      // Sinon utiliser le tab (trending, new, breaking)
      return polymarketDbService.fetchEventsByTab(tab, limit, offset);
    },
    staleTime: cacheConfigs.featured.staleTime,
    gcTime: cacheConfigs.featured.gcTime,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
