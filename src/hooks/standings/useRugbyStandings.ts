import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { RugbyStanding } from '@/types/standings/rugby';

export function useRugbyStandings(leagueId: string) {
  return useQuery({
    queryKey: ['rugby-standings', leagueId],
    queryFn: async () => {
      const { data: standingsData, error } = await sportsDataClient
        .from('standings')
        .select(`
          id,
          rank,
          stats_total,
          stage,
          description,
          team_id,
          teams (
            id,
            name,
            slug,
            logo
          )
        `)
        .eq('league_id', leagueId)
        .order('rank', { ascending: true });

      if (error) throw error;

      const standings: RugbyStanding[] = (standingsData || []).map((standing: any) => {
        const stats = standing.stats_total || {};
        const team = standing.teams || {};
        
        return {
          id: standing.id,
          position: standing.rank || 0,
          team: {
            id: team.id || '',
            name: team.name || '',
            logo: team.logo || '',
            slug: team.slug || '',
          },
          gamesPlayed: stats.gamesPlayed || 0,
          wins: stats.wins || 0,
          draws: stats.draws || 0,
          loses: stats.loses || 0,
          scoredPoints: stats.scoredPoints || 0,
          receivedPoints: stats.receivedPoints || 0,
          pointsDifference: (stats.scoredPoints || 0) - (stats.receivedPoints || 0),
          points: stats.points || 0,
          stage: standing.stage,
          description: standing.description,
        };
      });

      return standings;
    },
    enabled: !!leagueId,
  });
}
