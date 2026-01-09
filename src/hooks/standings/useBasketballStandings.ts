import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { BasketballStanding } from '@/types/standings/basketball';

export function useBasketballStandings(leagueId: string) {
  return useQuery({
    queryKey: ['basketball-standings', leagueId],
    queryFn: async (): Promise<BasketballStanding[]> => {
      const { data, error } = await sportsDataClient
        .from('standings')
        .select(`
          *,
          team:team_id(id, name, slug, logo)
        `)
        .eq('league_id', leagueId)
        .order('rank', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const statsTotal = row.stats_total || {};
        const wins = statsTotal.wins || 0;
        const losses = statsTotal.loses || 0;
        const gamesPlayed = statsTotal.gamesPlayed || (wins + losses);
        const scoredPoints = statsTotal.scoredPoints || 0;
        const receivedPoints = statsTotal.receivedPoints || 0;
        
        return {
          id: row.id,
          position: row.rank || 0,
          team: {
            id: row.team.id,
            name: row.team.name,
            slug: row.team.slug,
            logo: row.team.logo || '/placeholder.svg',
          },
          wins,
          losses,
          gamesPlayed,
          scoredPoints,
          receivedPoints,
          win_pct: gamesPlayed > 0 ? wins / gamesPlayed : 0,
          games_behind: statsTotal.gamesBehind || statsTotal.games_behind,
          streak: statsTotal.streak || row.streak,
          conference: row.conference,
          division: row.division,
          stage: row.stage,
          group_name: row.group_name,
          description: row.description,
        };
      });
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
