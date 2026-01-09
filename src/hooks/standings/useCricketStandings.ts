import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { CricketStanding, CricketStandingRow } from '@/types/standings/cricket';

export function useCricketStandings(leagueId: string, season?: number) {
  return useQuery({
    queryKey: ['cricket-standings', leagueId, season],
    queryFn: async () => {
      // Fetch standings
      const { data: standingsData, error: standingsError } = await sportsDataClient
        .from('standings')
        .select('id, rank, stats_total, team_id, stage, group_name')
        .eq('league_id', leagueId)
        .order('rank', { ascending: true });

      if (standingsError) throw standingsError;
      if (!standingsData) return [];

      const teamIds = standingsData.map(s => s.team_id);

      // Fetch team details
      const { data: teamsData, error: teamsError } = await sportsDataClient
        .from('teams')
        .select('id, name, display_name, logo, slug')
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      const teamsMap = new Map(teamsData?.map(team => [team.id, team]) || []);

      // Transform data
      const standings: CricketStanding[] = standingsData.map((standing: CricketStandingRow) => {
        const team = teamsMap.get(standing.team_id);
        const stats = standing.stats_total;

        return {
          id: standing.id,
          position: standing.rank,
          team: {
            id: standing.team_id,
            name: team?.display_name || team?.name || 'Unknown',
            logo: team?.logo || '',
            slug: team?.slug,
          },
          matchesPlayed: stats.matchesPlayed || 0,
          wins: stats.wins || 0,
          losses: stats.loses || 0,
          ties: stats.ties || 0,
          points: stats.points || 0,
          runsFor: stats.pointsFor || '-',
          runsAgainst: stats.pointsAgainst || '-',
          netRunRate: stats.netRunRate,
          stage: standing.stage,
          group_name: standing.group_name,
        };
      });

      return standings;
    },
    enabled: !!leagueId,
  });
}
