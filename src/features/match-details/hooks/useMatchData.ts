import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Types for match data
export interface MatchEvent {
  id: string;
  eventType: string;
  eventTime: string;
  eventMinute: number | null;
  team: {
    id: string | null;
    providerId: number;
    name: string;
    logo: string;
  };
  player: {
    id: string | null;
    providerId: number;
    name: string;
  };
  assistingPlayer: {
    id: string | null;
    providerId: number;
    name: string;
  } | null;
  substitutedPlayer: {
    name: string;
  } | null;
}

export interface TeamStatistics {
  [key: string]: number | string;
}

export interface MatchStatistics {
  home: TeamStatistics | null;
  away: TeamStatistics | null;
}

export interface MatchVenue {
  name: string | null;
  city: string | null;
  capacity: number | null;
}

export interface MatchReferee {
  name: string | null;
  nationality: string | null;
}

export interface MatchForecast {
  status: string | null;
  temperature: number | null;
}

// Baseball-specific states
export interface BaseballStates {
  score: string;
  report: string;
  description: string;
  scoreDetails: {
    home: {
      hits: number;
      errors: number;
      innings: number[];
    };
    away: {
      hits: number;
      errors: number;
      innings: number[];
    };
  };
}

export interface MatchDataResponse {
  source: 'cache' | 'api' | 'stale_cache' | 'no_highlightly_id';
  matchId: string;
  sportSlug?: string;
  // Team IDs from sports_data.match for H2H
  homeTeamId?: string;
  awayTeamId?: string;
  events: MatchEvent[];
  statistics: MatchStatistics | CricketInning[] | null;
  venue: MatchVenue | null;
  referee: MatchReferee | null;
  forecast: MatchForecast | null;
  stage: string | null;
  round: string | null;
  shots: any[];
  news: any[];
  predictions: any | null;
  // American Football specific
  boxScores?: any[];
  topPerformers?: any;
  injuries?: any[];
  // Baseball specific
  states?: BaseballStates | any;
}

// Cricket-specific types - matches real API structure
export interface CricketInning {
  inningNumber: number;
  team: {
    id: number;
    name: string;
    logo: string;
    abbreviation: string;
    fallOfWickets: Array<{
      runs: number;
      order: number;
      overs: number;
      dismissalBatsman: { name: string };
    }>;
    inningBatsmen: Array<{
      runs: number | null;
      balls: number | null;
      fours: number | null;
      sixes: number | null;
      battingStrikeRate: number | null;
      player: {
        name: string;
        roles?: string[];
        battingStyles?: string[];
        bowlingStyles?: string[];
      };
    }>;
    inningBowlers: Array<{
      overs: number;
      maidens: number;
      wickets: number;
      concededRuns: number;
      economy: number | null;
      player: {
        name: string;
        roles?: string[];
        battingStyles?: string[];
        bowlingStyles?: string[];
      };
    }>;
    inningPartnerships: Array<{
      runs: number;
      balls: number;
      overs: number;
      firstPlayer: { name: string };
      secondPlayer: { name: string };
      firstPlayerRuns: number;
      firstPlayerBalls: number;
      secondPlayerRuns: number;
      secondPlayerBalls: number;
    }>;
  };
}

export function useMatchData(stgAzuroId: string | null) {
  return useQuery({
    queryKey: ['match-data', stgAzuroId],
    queryFn: async (): Promise<MatchDataResponse | null> => {
      if (!stgAzuroId) return null;

      logger.debug(`[useMatchData] Fetching data for ${stgAzuroId}`);

      const { data, error } = await supabase.functions.invoke('fetch-match-data', {
        body: { stgAzuroId }
      });

      if (error) {
        logger.error(`[useMatchData] Error: ${error.message}`);
        throw new Error(error.message);
      }

      logger.debug(`[useMatchData] Received data:`, {
        source: data?.source,
        eventsCount: data?.events?.length || 0,
        hasStatistics: !!data?.statistics,
        hasVenue: !!data?.venue,
      });

      return data;
    },
    enabled: !!stgAzuroId,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
