import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { HandballStanding } from '@/types/standings/handball';

export function useHandballStandings(leagueId: string) {
  return useQuery({
    queryKey: ['handball-standings', leagueId],
    queryFn: async () => {
      const { data: standingsData, error } = await sportsDataClient
        .from('standings')
        .select(`
          id,
          rank,
          stats_total,
          team_id,
          stage,
          group_name,
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

      const standings: HandballStanding[] = standingsData?.map((standing: any) => {
        const stats = standing.stats_total || {};
        const scoredPoints = stats.scoredGaols || 0;
        const receivedPoints = stats.receivedGoals || 0;

        return {
          id: standing.id,
          position: standing.rank || 0,
          team: {
            id: standing.teams?.id || standing.team_id,
            name: standing.teams?.name || 'Unknown Team',
            slug: standing.teams?.slug,
            logo: standing.teams?.logo || '',
          },
          gamesPlayed: stats.gamesPlayed || 0,
          wins: stats.wins || 0,
          draws: stats.draws || 0,
          loses: stats.loses || 0,
          scoredPoints,
          receivedPoints,
          pointsDifference: scoredPoints - receivedPoints,
          points: stats.points || 0,
          stage: standing.stage,
          group_name: standing.group_name,
        };
      }) || [];

      return standings;
    },
    enabled: !!leagueId,
  });
}
