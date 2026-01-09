import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

export interface TeamStandingDisplay {
  id: string;
  league: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  };
  sport: {
    id: string;
    name: string;
    slug: string;
  };
  rank: number;
  team: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  season: number;
  group_name?: string | null;
  conference?: string | null;
  stage?: string | null;
  division?: string | null;
  // Home stats
  home_played?: number;
  home_wins?: number;
  home_draws?: number;
  home_losses?: number;
  home_goals_for?: number;
  home_goals_against?: number;
  // Away stats
  away_played?: number;
  away_wins?: number;
  away_draws?: number;
  away_losses?: number;
  away_goals_for?: number;
  away_goals_against?: number;
  hasHomeAwayStats: boolean;
  // NFL specific
  ties?: number;
  win_pct?: number;
  differential?: string;
  streak?: string;
  overall_record?: string;
  home_record?: string;
  road_record?: string;
  // Basketball specific
  games_behind?: number | string;
  scored_points?: number;
  received_points?: number;
  // Hockey specific
  wins_overtime?: number;
  losses_overtime?: number;
  scored_goals?: number;
  received_goals?: number;
  // Baseball specific
  runs_scored?: number;
  runs_allowed?: number;
  run_differential?: number;
  last_ten?: string;
  // Cricket specific
  net_run_rate?: number;
  matches_played?: number;
  // Volleyball specific
  sets_won?: number;
  sets_lost?: number;
  sets_difference?: number;
  // Rugby/Handball specific
  points_difference?: number;
  // Raw stats from database
  raw_stats?: Record<string, any>;
}

interface StatsTotal {
  total?: {
    wins: number;
    draws: number;
    games: number;
    loses: number;
    scoredGoals: number;
    receivedGoals: number;
  };
  home?: {
    wins: number;
    draws: number;
    games: number;
    loses: number;
    scoredGoals: number;
    receivedGoals: number;
  };
  away?: {
    wins: number;
    draws: number;
    games: number;
    loses: number;
    scoredGoals: number;
    receivedGoals: number;
  };
  points?: number;
  wins?: number;
  draws?: number;
  games?: number;
  loses?: number;
  scoredGoals?: number;
  receivedGoals?: number;
}

function transformStatsBySort(stats: any, sportSlug: string): any {
  if (!stats) {
    return {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      hasHomeAwayStats: false,
    };
  }

  // Football/Soccer: { total: { wins, draws, loses, games, scoredGoals, receivedGoals }, home, away, points }
  if (sportSlug === 'football' || sportSlug === 'soccer') {
    if (stats.total) {
      const goalsFor = stats.total.scoredGoals || 0;
      const goalsAgainst = stats.total.receivedGoals || 0;
      const hasHomeAwayStats = !!(stats.home && stats.away);
      
      return {
        played: stats.total.games || 0,
        wins: stats.total.wins || 0,
        draws: stats.total.draws || 0,
        losses: stats.total.loses || 0,
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        goal_difference: goalsFor - goalsAgainst,
        points: stats.points || 0,
        home_played: stats.home?.games,
        home_wins: stats.home?.wins,
        home_draws: stats.home?.draws,
        home_losses: stats.home?.loses,
        home_goals_for: stats.home?.scoredGoals,
        home_goals_against: stats.home?.receivedGoals,
        away_played: stats.away?.games,
        away_wins: stats.away?.wins,
        away_draws: stats.away?.draws,
        away_losses: stats.away?.loses,
        away_goals_for: stats.away?.scoredGoals,
        away_goals_against: stats.away?.receivedGoals,
        hasHomeAwayStats,
      };
    }
  }

  // NFL: { wins, losses, ties, win_percentage, differential, streak, home_record, road_record }
  if (sportSlug === 'american-football') {
    return {
      played: (stats.wins || 0) + (stats.losses || 0) + (stats.ties || 0),
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      ties: stats.ties || 0,
      win_pct: stats.win_percentage || 0,
      differential: stats.differential || '0',
      streak: stats.streak || '',
      home_record: stats.home_record || '',
      road_record: stats.road_record || '',
      points: 0,
      draws: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      hasHomeAwayStats: !!(stats.home_record && stats.road_record),
    };
  }

  // Basketball: { wins, loses, gamesPlayed, scoredPoints, receivedPoints, gamesBehind, streak }
  if (sportSlug === 'basketball') {
    const pointsFor = stats.scoredPoints || 0;
    const pointsAgainst = stats.receivedPoints || 0;
    return {
      played: stats.gamesPlayed || 0,
      wins: stats.wins || 0,
      losses: stats.loses || 0,
      win_pct: stats.gamesPlayed ? (stats.wins / stats.gamesPlayed) : 0,
      scored_points: pointsFor,
      received_points: pointsAgainst,
      goal_difference: pointsFor - pointsAgainst,
      games_behind: stats.gamesBehind || 0,
      streak: stats.streak || '',
      points: 0,
      draws: 0,
      goals_for: 0,
      goals_against: 0,
      hasHomeAwayStats: false,
    };
  }

  // Hockey: { wins, loses, gamesPlayed, scoredGoals, receivedGoals, winsOvertime, losesOvertime }
  if (sportSlug === 'hockey') {
    const goalsFor = stats.scoredGoals || 0;
    const goalsAgainst = stats.receivedGoals || 0;
    return {
      played: stats.gamesPlayed || 0,
      wins: stats.wins || 0,
      losses: stats.loses || 0,
      wins_overtime: stats.winsOvertime || 0,
      losses_overtime: stats.losesOvertime || 0,
      scored_goals: goalsFor,
      received_goals: goalsAgainst,
      goal_difference: goalsFor - goalsAgainst,
      points: (stats.wins || 0) * 2 + (stats.winsOvertime || 0) + (stats.losesOvertime || 0),
      draws: 0,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      hasHomeAwayStats: false,
    };
  }

  // Baseball: { w, l, gp, pct, gb, strk, rs, ra, diff, home, away, last_ten }
  if (sportSlug === 'baseball') {
    return {
      played: stats.gp || stats.gamesPlayed || 0,
      wins: stats.w || stats.wins || 0,
      losses: stats.l || stats.loses || 0,
      win_pct: stats.pct || stats.winPct || 0,
      runs_scored: stats.rs || stats.runsScored || 0,
      runs_allowed: stats.ra || stats.runsAllowed || 0,
      run_differential: stats.diff || stats.runDifferential || 0,
      games_behind: stats.gb || stats.gamesBehind || 0,
      streak: stats.strk || stats.streak || '',
      last_ten: stats.last_ten || stats.lastTen || '',
      home_record: stats.home || stats.homeRecord || '',
      road_record: stats.away || stats.awayRecord || '',
      points: 0,
      draws: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      hasHomeAwayStats: !!(stats.home && stats.away),
    };
  }

  // Cricket: { matchesPlayed, wins, loses, ties, points, pointsFor, pointsAgainst, netRunRate }
  if (sportSlug === 'cricket') {
    return {
      played: stats.matchesPlayed || 0,
      matches_played: stats.matchesPlayed || 0,
      wins: stats.wins || 0,
      losses: stats.loses || 0,
      ties: stats.ties || 0,
      points: stats.points || 0,
      net_run_rate: stats.netRunRate,
      draws: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      hasHomeAwayStats: false,
    };
  }

  // Volleyball: { gamesPlayed, wins, loses, scoredPoints, receivedPoints, points }
  if (sportSlug === 'volleyball') {
    const setsWon = stats.scoredPoints || 0;
    const setsLost = stats.receivedPoints || 0;
    return {
      played: stats.gamesPlayed || 0,
      wins: stats.wins || 0,
      losses: stats.loses || 0,
      sets_won: setsWon,
      sets_lost: setsLost,
      sets_difference: setsWon - setsLost,
      points: stats.points || 0,
      draws: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      hasHomeAwayStats: false,
    };
  }

  // Rugby/Handball: { gamesPlayed, wins, draws, loses, scoredPoints, receivedPoints, pointsDifference, points }
  if (sportSlug === 'rugby' || sportSlug === 'handball') {
    const pointsFor = stats.scoredPoints || 0;
    const pointsAgainst = stats.receivedPoints || 0;
    return {
      played: stats.gamesPlayed || 0,
      wins: stats.wins || 0,
      draws: stats.draws || 0,
      losses: stats.loses || 0,
      scored_points: pointsFor,
      received_points: pointsAgainst,
      points_difference: stats.pointsDifference || (pointsFor - pointsAgainst),
      points: stats.points || 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      hasHomeAwayStats: false,
    };
  }

  // Default fallback
  return {
    played: stats.games || stats.gamesPlayed || 0,
    wins: stats.wins || 0,
    draws: stats.draws || 0,
    losses: stats.loses || 0,
    goals_for: stats.scoredGoals || stats.scoredPoints || 0,
    goals_against: stats.receivedGoals || stats.receivedPoints || 0,
    goal_difference: (stats.scoredGoals || stats.scoredPoints || 0) - (stats.receivedGoals || stats.receivedPoints || 0),
    points: stats.points || 0,
    hasHomeAwayStats: false,
  };
}

export function useTeamStandingsForDisplay(teamId: string | undefined, leagueId: string | null | undefined) {
  return useQuery({
    queryKey: ['team-standings-display', teamId, leagueId],
    queryFn: async (): Promise<TeamStandingDisplay[]> => {
      if (!teamId) return [];

      let query = sportsDataClient
        .from('standings')
        .select(`
          id,
          season,
          rank,
          stats_total,
          group_name,
          conference,
          stage,
          division,
          league:league_id(
            id, 
            name, 
            slug, 
            logo,
            sport:sport_id(id, name, slug)
          ),
          team:team_id(id, name, slug, logo)
        `)
        .eq('team_id', teamId)
        .order('season', { ascending: false });

      // Filter by league if specified
      if (leagueId) {
        query = query.eq('league_id', leagueId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return [];

      // Transform the data
      return data.map((standing: any) => {
        const sportSlug = standing.league?.sport?.slug || 'football';
        const stats = transformStatsBySort(standing.stats_total, sportSlug);
        
        return {
          id: standing.id,
          league: {
            id: standing.league?.id || '',
            name: standing.league?.name || 'Unknown League',
            logo: standing.league?.logo || null,
            slug: standing.league?.slug || '',
          },
          sport: {
            id: standing.league?.sport?.id || '',
            name: standing.league?.sport?.name || 'Football',
            slug: sportSlug,
          },
          rank: standing.rank || 0,
          team: {
            id: standing.team?.id || '',
            name: standing.team?.name || 'Unknown Team',
            logo: standing.team?.logo || null,
            slug: standing.team?.slug || '',
          },
          season: standing.season,
          group_name: standing.group_name,
          conference: standing.conference,
          stage: standing.stage,
          division: standing.division,
          raw_stats: standing.stats_total || {},
          ...stats,
        };
      });
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}
