import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { NFLStanding } from '@/types/standings/nfl';

export function useNFLStandings(leagueId: string) {
  return useQuery({
    queryKey: ['nfl-standings', leagueId],
    queryFn: async () => {
      const { data, error } = await sportsDataClient
        .from('standings')
        .select(`
          id,
          team_id,
          conference,
          division,
          group_name,
          stage,
          stats_total,
          raw
        `)
        .eq('league_id', leagueId);

      if (error) throw error;
      if (!data) return [];

      // Transformer les données brutes en NFLStanding
      const standings: NFLStanding[] = data.map((row: any) => {
        const stats = row.stats_total || {};
        const rawTeam = row.raw?.team || {};

        return {
          id: row.id,
          position: 0,
          team: {
            id: row.team_id,
            name: rawTeam.name || 'Unknown',
            abbreviation: rawTeam.abbreviation,
            logo: rawTeam.logo || '/placeholder.svg',
          },
          wins: stats.wins || 0,
          losses: stats.losses || 0,
          ties: stats.ties || 0,
          win_pct: parseFloat(stats.win_percentage || 0),
          games_behind: stats.games_behind === null ? '-' : stats.games_behind,
          differential: String(stats.differential || stats.point_differential || 0),
          streak: String(stats.streak || ''),
          conference: row.conference,
          division: row.division,
          stage: row.stage,
          overall_record: stats.overall_record,
          home_record: stats.home_record,
          road_record: stats.road_record,
          division_record: stats.division_record,
          playoff_seed: stats.playoff_seed,
        };
      });

      // Retourner les standings sans calculer le ranking
      return standings;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}
