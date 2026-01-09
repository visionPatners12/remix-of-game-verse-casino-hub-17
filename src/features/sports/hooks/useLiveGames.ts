import { useSupabaseGames } from './useSupabaseGames';

/**
 * Hook pour récupérer uniquement les matchs en live depuis Supabase
 * Utilise stg_azuro_games avec is_live=true
 * 
 * Mapping des IDs:
 * - match.id = UUID Supabase → pour navigation
 * - match.gameId = Azuro ID → pour marchés, réactions, commentaires
 */
export const useLiveGames = (options?: {
  limit?: number;
  orderBy?: 'turnover' | 'start_iso';
  sportSlug?: string;
  leagueSlug?: string;
}) => {
  const {
    limit = 100,
    orderBy = 'turnover',
    sportSlug,
    leagueSlug,
  } = options || {};

  return useSupabaseGames({
    limit,
    orderBy,
    sportSlug,
    leagueSlug,
    isLive: true,
    staleTime: 10_000, // Rafraîchissement fréquent pour les matchs live
  });
};
