import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

interface UseLeagueMatchesProps {
  leagueId: string;
}

/**
 * Simplified hook to fetch ALL league matches with pure SQL query
 * - No date filtering (handled client-side)
 * - No limit (handled client-side)
 * - Simple join query for optimal performance
 */
export function useLeagueMatches({ leagueId }: UseLeagueMatchesProps) {
  return useQuery({
    queryKey: ['league-matches', leagueId],
    queryFn: async () => {
      const { data, error } = await sportsDataClient
        .from('match')
        .select(`
          id,
          starts_at,
          status_long,
          sport:sport_id(id, name, slug),
          league:league_id(id, name, slug, logo),
          home_team:home_team_id(id, name, display_name, logo),
          away_team:away_team_id(id, name, display_name, logo),
          azuro:stg_azuro_games(azuro_game_id, is_live, is_prematch, states)
        `)
        .eq('league_id', leagueId)
        .order('starts_at', { ascending: true });

      if (error) throw error;

      // Simple, consistent mapping
      return (data ?? []).map((m: any) => {
        const azuroData = m.azuro?.[0];
        return {
          id: m.id,
          startsAt: m.starts_at,
          status_long: m.status_long,
          sport: m.sport,
          league: m.league,
          participants: [
            { 
              name: m.home_team?.display_name || m.home_team?.name, 
              image: m.home_team?.logo 
            },
            { 
              name: m.away_team?.display_name || m.away_team?.name, 
              image: m.away_team?.logo 
            },
          ],
          gameId: azuroData?.azuro_game_id ?? m.id,
          azuro_game_id: azuroData?.azuro_game_id ?? null,
          is_live: azuroData?.is_live ?? false,
          is_prematch: azuroData?.is_prematch ?? false,
          states: azuroData?.states ?? null,
        };
      });
    },
    staleTime: 30_000,
    gcTime: 300_000,
  });
}
