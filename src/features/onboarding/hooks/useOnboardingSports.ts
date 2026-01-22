import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/client';
import { getSportIcon } from '@/lib/sportIconsLite';

/**
 * Interface pour les sports de l'onboarding
 */
export interface OnboardingSport {
  id: string;
  name: string;
  icon: React.ComponentType;
  category: string;
  azuro_id: number | null;
}

/**
 * Hook dédié à l'onboarding pour récupérer les sports depuis sports_data.sport
 * Utilise une query key unique pour éviter les collisions
 */
export function useOnboardingSports() {
  return useQuery({
    queryKey: ['onboarding', 'sports'],
    queryFn: async (): Promise<OnboardingSport[]> => {
      
      const { data, error } = await sportsDataClient
        .schema('sports_data')
        .from('sport')
        .select('id, name, slug, icon_name, azuro_id, category, display_order')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ [useOnboardingSports] Error fetching sports:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ [useOnboardingSports] No sports found in database');
        return [];
      }

      // Map les sports avec leurs icônes React
      return data.map(sport => {
        return {
          id: sport.id,
          name: sport.name,
          icon: getSportIcon(sport.icon_name),
          category: sport.category || 'sport',
          azuro_id: sport.azuro_id,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 heure
    retry: 2,
  });
}
