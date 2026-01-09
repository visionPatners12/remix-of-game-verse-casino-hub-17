import { sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { 
  FootballApiLeague,
  FootballApiFixtureData,
  FootballApiStanding,
  TeamGlobalParams 
} from '@/types/footballApi';

// Cache durations in milliseconds
const CACHE_DURATIONS = {
  PROFILE: 7 * 24 * 60 * 60 * 1000, // 7 days
  STANDINGS: 6 * 60 * 60 * 1000, // 6 hours
} as const;

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; duration: number }>();

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.duration) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, duration: number): void {
  cache.set(key, { data, timestamp: Date.now(), duration });
}

// Helper to format timezone for Africa/Douala
export function formatToDoualaTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    timeZone: 'Africa/Douala',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export async function getTeamLeagues(params: TeamGlobalParams): Promise<FootballApiLeague[]> {
  const cacheKey = `team-leagues-${params.team_id}`;
  const cached = getCachedData<FootballApiLeague[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await sportsDataClient
      .from('standings')
      .select(`
        season,
        league:league_id (
          id,
          name,
          slug,
          logo
        )
      `)
      .eq('team_id', params.team_id);

    if (error) {
      logger.error('Error fetching team leagues from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      setCachedData(cacheKey, [], CACHE_DURATIONS.PROFILE);
      return [];
    }

    // Transform Supabase data to FootballApiLeague format
    const uniqueLeagues = new Map();
    data.forEach((item: any) => {
      if (item.league && !uniqueLeagues.has(item.league.id)) {
        uniqueLeagues.set(item.league.id, {
          id: item.league.id,
          name: item.league.name,
          type: 'League',
          logo: item.league.logo || '',
          country: '',
          flag: '',
          season: item.season
        });
      }
    });

    const leagues: FootballApiLeague[] = Array.from(uniqueLeagues.values());
    setCachedData(cacheKey, leagues, CACHE_DURATIONS.PROFILE);
    return leagues;
  } catch (error) {
    logger.error('Error fetching team leagues:', error);
    return [];
  }
}

export async function getTeamStanding(params: TeamGlobalParams): Promise<FootballApiStanding | null> {
  if (!params.league_id) return null;

  const cacheKey = `team-standing-${params.league_id}-${params.season}-${params.team_id}`;
  const cached = getCachedData<FootballApiStanding>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await sportsDataClient
      .from('standings')
      .select(`
        rank,
        games_played,
        wins,
        draws,
        losses,
        points,
        goals_for,
        goals_against,
        goal_diff,
        form,
        team:team_id (
          id,
          name,
          logo
        )
      `)
      .eq('team_id', params.team_id)
      .eq('league_id', params.league_id)
      .eq('season', parseInt(params.season))
      .maybeSingle();

    if (error || !data) {
      logger.error('Error fetching team standing from Supabase:', error);
      return null;
    }

    // Transform to FootballApiStanding format
    const teamData = Array.isArray(data.team) ? data.team[0] : data.team;
    const standing: FootballApiStanding = {
      rank: data.rank,
      team: {
        id: parseInt(teamData.id),
        name: teamData.name,
        logo: teamData.logo || '',
        winner: null
      },
      points: data.points || 0,
      goalsDiff: data.goal_diff || 0,
      group: 'Regular Season',
      form: data.form || '',
      status: null,
      description: null,
      all: {
        played: data.games_played || 0,
        win: data.wins || 0,
        draw: data.draws || 0,
        lose: data.losses || 0,
        goals: {
          for: data.goals_for || 0,
          against: data.goals_against || 0
        }
      },
      home: {
        played: 0,
        win: 0,
        draw: 0,
        lose: 0,
        goals: { for: 0, against: 0 }
      },
      away: {
        played: 0,
        win: 0,
        draw: 0,
        lose: 0,
        goals: { for: 0, against: 0 }
      },
      update: new Date().toISOString()
    };

    setCachedData(cacheKey, standing, CACHE_DURATIONS.STANDINGS);
    return standing;
  } catch (error) {
    logger.error('Error fetching team standing:', error);
    return null;
  }
}

// Utility functions
export function calculateGoalsDifference(matches: FootballApiFixtureData[], teamId: string): {
  goalsFor: number;
  goalsAgainst: number;
} {
  let goalsFor = 0;
  let goalsAgainst = 0;

  matches.forEach(match => {
    const isHome = match.teams.home.id === parseInt(teamId);
    const homeGoals = match.goals.home || 0;
    const awayGoals = match.goals.away || 0;

    if (isHome) {
      goalsFor += homeGoals;
      goalsAgainst += awayGoals;
    } else {
      goalsFor += awayGoals;
      goalsAgainst += homeGoals;
    }
  });

  return { goalsFor, goalsAgainst };
}

export function getMatchResult(match: FootballApiFixtureData, teamId: string): 'W' | 'D' | 'L' {
  const isHome = match.teams.home.id === parseInt(teamId);
  const homeGoals = match.goals.home || 0;
  const awayGoals = match.goals.away || 0;

  if (homeGoals === awayGoals) return 'D';
  
  if (isHome) {
    return homeGoals > awayGoals ? 'W' : 'L';
  } else {
    return awayGoals > homeGoals ? 'W' : 'L';
  }
}
