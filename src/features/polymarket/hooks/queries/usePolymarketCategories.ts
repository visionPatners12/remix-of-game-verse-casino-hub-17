import { useQuery } from '@tanstack/react-query';
import { polymarketDbService } from '../../services/api/polymarketDbService';

export const POLYMARKET_CATEGORY_KEYS = {
  all: ['polymarket-categories'] as const,
  subcategories: (categoryTagId: string) => ['polymarket-subcategories', categoryTagId] as const,
};

/**
 * Hook pour fetcher toutes les categories actives depuis Supabase
 */
export const usePolymarketCategories = () => {
  return useQuery({
    queryKey: POLYMARKET_CATEGORY_KEYS.all,
    queryFn: () => polymarketDbService.fetchCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes (categories changent rarement)
    gcTime: 1000 * 60 * 60,    // 1 heure
  });
};

/**
 * Hook pour fetcher les sous-categories d'une categorie depuis Supabase
 */
export const usePolymarketSubcategories = (categoryTagId: string | null) => {
  return useQuery({
    queryKey: POLYMARKET_CATEGORY_KEYS.subcategories(categoryTagId || ''),
    queryFn: () => polymarketDbService.fetchSubcategories(categoryTagId!),
    enabled: !!categoryTagId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,    // 1 heure
  });
};
