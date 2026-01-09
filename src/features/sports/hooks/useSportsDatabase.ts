import { useQuery } from '@tanstack/react-query';
import { sportsService, type SportRecord } from '@/services/database/sportsService';
import { getSportById } from '@/lib/sportsMapping';

/**
 * Interface pour les sports avec icônes React
 */
export interface SportWithIcon extends SportRecord {
  icon: React.ComponentType;
}

/**
 * Hook pour récupérer tous les sports depuis la base de données
 */
export function useSportsDatabase() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async (): Promise<SportWithIcon[]> => {
      const sports = await sportsService.getAllSports();
      
      // Ajouter les icônes React à chaque sport
      return sports.map(sport => ({
        ...sport,
        icon: getSportById(sport.azuro_id.toString(), sport.name).icon
      }));
    },
    staleTime: 60 * 60 * 1000, // 1 heure - les sports changent rarement
    gcTime: 24 * 60 * 60 * 1000, // 24 heures
  });
}

/**
 * Hook pour récupérer un sport par son ID Azuro
 */
export function useSportByAzuroId(azuroId: number) {
  return useQuery({
    queryKey: ['sport', 'azuro', azuroId],
    queryFn: async (): Promise<SportWithIcon | null> => {
      const sport = await sportsService.getSportByAzuroId(azuroId);
      
      if (!sport) return null;
      
      return {
        ...sport,
        icon: getSportById(sport.azuro_id.toString(), sport.name).icon
      };
    },
    enabled: !!azuroId,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer un sport par son slug
 */
export function useSportBySlug(slug: string) {
  return useQuery({
    queryKey: ['sport', 'slug', slug],
    queryFn: async (): Promise<SportWithIcon | null> => {
      const sport = await sportsService.getSportBySlug(slug);
      
      if (!sport) return null;
      
      return {
        ...sport,
        icon: getSportById(sport.azuro_id.toString(), sport.name).icon
      };
    },
    enabled: !!slug,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les sports par catégorie
 */
export function useSportsByCategory(category: string) {
  return useQuery({
    queryKey: ['sports', 'category', category],
    queryFn: async (): Promise<SportWithIcon[]> => {
      const sports = await sportsService.getSportsByCategory(category);
      
      return sports.map(sport => ({
        ...sport,
        icon: getSportById(sport.azuro_id.toString(), sport.name).icon
      }));
    },
    enabled: !!category,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}