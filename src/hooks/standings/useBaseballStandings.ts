import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { BaseballStanding } from '@/types/standings/baseball';

export function useBaseballStandings(leagueId: string) {
  return useQuery({
    queryKey: ['baseball-standings', leagueId],
    queryFn: async (): Promise<BaseballStanding[]> => {
      const { data: standingsData, error: standingsError } = await sportsDataClient
        .from('standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('rank', { ascending: true });

      if (standingsError) throw standingsError;
      if (!standingsData || standingsData.length === 0) return [];

      const teamIds = [...new Set(standingsData.map(s => s.team_id).filter(Boolean))];
      const { data: teamsData, error: teamsError } = await sportsDataClient
        .from('teams')
        .select('id, name, display_name, logo, slug')
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      const teamsMap = new Map((teamsData || []).map(team => [team.id, team]));

      // Group by stage/division and calculate positions
      const groupedByStage: Record<string, any[]> = {};
      standingsData.forEach((row) => {
        const stageName = row.stage || row.description || row.group_name || 'Division';
        if (!groupedByStage[stageName]) {
          groupedByStage[stageName] = [];
        }
        groupedByStage[stageName].push(row);
      });

      // Sort each group by wins and assign positions
      const result: BaseballStanding[] = [];
      
      Object.values(groupedByStage).forEach((groupData) => {
        const sortedGroup = [...groupData].sort((a, b) => {
          const aWins = a.stats_total?.w || 0;
          const bWins = b.stats_total?.w || 0;
          return bWins - aWins;
        });

        sortedGroup.forEach((row, index) => {
          const team = teamsMap.get(row.team_id);
          const stats = row.stats_total || {};
          
          result.push({
            id: row.id,
            position: index + 1,
            team: {
              id: team?.id || row.team_id,
              name: team?.name || 'Unknown Team',
              logo: team?.logo || '/placeholder.svg',
              slug: team?.slug
            },
            wins: stats.w || 0,
            losses: stats.l || 0,
            gamesPlayed: stats.gp || 0,
            winPct: parseFloat(stats.pct || '0'),
            gamesBehind: stats.gb || '-',
            streak: stats.strk || '-',
            runsScored: stats.rs || 0,
            runsAllowed: stats.ra || 0,
            runDifferential: stats.diff || 0,
            homeRecord: stats.home || '-',
            awayRecord: stats.away || '-',
            totalRecord: stats.total || '-',
            lastTen: stats.last_ten || '-',
            intraDivision: stats.intradivision,
            intraLeague: stats.intraleague,
            clinch: stats.clinch,
            seed: stats.seed,
            playoffPct: stats.poff,
            group_name: row.group_name,
            stage: row.stage,
            description: row.description,
          });
        });
      });

      return result;
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
