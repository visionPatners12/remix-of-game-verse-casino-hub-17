import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { HockeyStanding } from '@/types/standings/hockey';

interface StatItem {
  displayName: string;
  value: string | number;
}

const getStatValue = (statistics: StatItem[] | undefined, name: string): string | number => {
  if (!Array.isArray(statistics)) return '';
  const stat = statistics.find(s => s.displayName === name);
  return stat?.value ?? '';
};

const parseNumber = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export function useHockeyStandings(leagueId: string) {
  return useQuery({
    queryKey: ['hockey-standings', leagueId],
    queryFn: async (): Promise<HockeyStanding[]> => {
      const { data, error } = await sportsDataClient
        .from('standings')
        .select(`
          *,
          team:team_id(id, name, slug, logo)
        `)
        .eq('league_id', leagueId)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any): HockeyStanding => {
        const statsTotal = row.stats_total || {};
        const team = row.team;

        // Detect format: array-based (NHL Highlightly) vs flat (KHL, generic)
        const isArrayFormat = Array.isArray(statsTotal.statistics);

        let gamesPlayed: number, wins: number, losses: number, overtimeLosses: number;
        let points: number, goalsFor: number, goalsAgainst: number, goalDifference: number;
        let streak: string;

        if (isArrayFormat) {
          // Array format (NHL Highlightly)
          const statistics = statsTotal.statistics;
          gamesPlayed = parseNumber(getStatValue(statistics, 'Games Played'));
          wins = parseNumber(getStatValue(statistics, 'Wins'));
          losses = parseNumber(getStatValue(statistics, 'Losses'));
          overtimeLosses = parseNumber(getStatValue(statistics, 'Overtime Losses'));
          points = parseNumber(getStatValue(statistics, 'Points'));
          goalsFor = parseNumber(getStatValue(statistics, 'Goals For'));
          goalsAgainst = parseNumber(getStatValue(statistics, 'Goals Against'));
          goalDifference = parseNumber(getStatValue(statistics, 'Goal Differential'));
          streak = String(getStatValue(statistics, 'Streak') || '');
        } else {
          // Flat format (KHL, generic hockey)
          gamesPlayed = parseNumber(statsTotal.gamesPlayed || statsTotal.games);
          wins = parseNumber(statsTotal.wins);
          losses = parseNumber(statsTotal.loses || statsTotal.losses);
          overtimeLosses = parseNumber(statsTotal.losesOvertime || statsTotal.overtimeLosses || 0);
          const winsOvertime = parseNumber(statsTotal.winsOvertime || 0);
          // Points calculation: typically 2 pts for win, 1 pt for OT win/loss
          points = parseNumber(statsTotal.points) || (wins * 2) + winsOvertime + overtimeLosses;
          goalsFor = parseNumber(statsTotal.scoredGoals || statsTotal.goalsFor);
          goalsAgainst = parseNumber(statsTotal.receivedGoals || statsTotal.goalsAgainst);
          goalDifference = goalsFor - goalsAgainst;
          streak = statsTotal.streak || '';
        }

        return {
          id: row.id,
          position: row.rank || 0,
          team: {
            id: team?.id || '',
            name: team?.name || '',
            slug: team?.slug || '',
            logo: team?.logo || '/placeholder.svg',
          },
          gamesPlayed,
          wins,
          losses,
          overtimeLosses,
          points,
          goalsFor,
          goalsAgainst,
          goalDifference,
          streak,
          stage: row.stage,
          group_name: row.group_name,
          conference: row.conference,
          division: row.division,
          description: row.description,
        };
      });
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
