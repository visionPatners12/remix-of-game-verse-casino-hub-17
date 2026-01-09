import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

interface SportMatchCounts {
  [sportId: string]: {
    total: number;
    live: number;
    prematch: number;
  };
}

export function useMatchCountsBySport() {
  return useQuery({
    queryKey: ['match-counts-by-sport'],
    queryFn: async (): Promise<SportMatchCounts> => {
      const { data: games, error } = await sportsDataClient
        .from('stg_azuro_games')
        .select('sport_id, is_prematch')
        .gt('start_iso', new Date().toISOString())
        .not('azuro_game_id', 'is', null);

      if (error) {
        console.error('Error fetching match counts:', error);
        throw error;
      }

      // Grouper et compter par sport_id
      return (games || []).reduce((acc, game) => {
        const sportId = game.sport_id;
        if (!sportId) return acc;

        if (!acc[sportId]) {
          acc[sportId] = { total: 0, live: 0, prematch: 0 };
        }

        acc[sportId].total++;
        if (game.is_prematch) acc[sportId].prematch++;

        return acc;
      }, {} as SportMatchCounts);
    },
    staleTime: 30_000, // 30 secondes
    gcTime: 60_000,
    refetchInterval: 60_000, // Rafraîchir toutes les minutes
  });
}
