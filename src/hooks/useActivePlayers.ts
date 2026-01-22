import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivePlayersData {
  ludoPlayers: number;
  totalPlayers: number;
}

export const useActivePlayers = () => {
  return useQuery({
    queryKey: ['active-players'],
    queryFn: async (): Promise<ActivePlayersData> => {
      // First get active game IDs
      const { data: activeGames, error: gamesError } = await supabase
        .from('ludo_games')
        .select('id')
        .in('status', ['active', 'created']);

      if (gamesError || !activeGames?.length) {
        return { ludoPlayers: 0, totalPlayers: 0 };
      }

      const gameIds = activeGames.map(g => g.id);

      // Count players in those games
      const { count, error } = await supabase
        .from('ludo_game_players')
        .select('*', { count: 'exact', head: true })
        .in('game_id', gameIds);

      if (error) {
        console.error('Error fetching active players:', error);
        return { ludoPlayers: 0, totalPlayers: 0 };
      }

      const players = count || 0;
      
      return {
        ludoPlayers: players,
        totalPlayers: players,
      };
    },
    refetchInterval: () => document.visibilityState === 'visible' ? 60000 : false,
    staleTime: 30000,
  });
};
