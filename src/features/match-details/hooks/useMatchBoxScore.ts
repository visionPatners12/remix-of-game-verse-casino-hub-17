import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface BoxScorePlayer {
  id: number;
  name: string;
  fullName: string;
  logo: string;
  matchRating: string;
  shirtNumber: number;
  isCaptain: boolean;
  position: string;
  minutesPlayed: number;
  isSubstitute: boolean;
  offsides: number;
  statistics: {
    goalsScored?: number;
    goalsSaved?: number;
    goalsConceded?: number;
    assists?: number;
    shotsTotal?: number;
    shotsOnTarget?: number;
    shotsOffTarget?: number;
    shotsAccuracy?: string;
    passesTotal?: number;
    passesSuccessful?: number;
    passesFailed?: number;
    passesAccuracy?: string;
    passesKey?: number;
    dribblesTotal?: number;
    dribblesSuccessful?: number;
    dribblesFailed?: number;
    dribbleSuccessRate?: string;
    tacklesTotal?: number;
    interceptionsTotal?: number;
    duelsTotal?: number;
    duelsWon?: number;
    duelsLost?: number;
    duelSuccessRate?: string;
    cardsYellow?: number;
    cardsRed?: number;
    cardsSecondYellow?: number;
    fouledByOthers?: number;
    fouledOthers?: number;
    penaltiesTotal?: number;
    penaltiesScored?: number;
    penaltiesMissed?: number;
    penaltiesAccuracy?: string;
    expectedGoals?: number;
    expectedAssists?: number;
    expectedGoalsOnTarget?: number;
    expectedGoalsOnTargetConceded?: number;
    expectedGoalsPrevented?: number;
    [key: string]: unknown;
  };
}

export interface TeamBoxScore {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  players: BoxScorePlayer[];
}

export interface BoxScoreData {
  source: 'cache' | 'api';
  matchId: string;
  homeTeam: TeamBoxScore | null;
  awayTeam: TeamBoxScore | null;
}

async function fetchBoxScore(stgAzuroId: string): Promise<BoxScoreData> {
  logger.debug(`[useMatchBoxScore] Fetching box score for stgAzuroId: ${stgAzuroId}`);

  const { data, error } = await supabase.functions.invoke('fetch-match-boxscore', {
    body: { stgAzuroId }
  });

  if (error) {
    logger.error(`[useMatchBoxScore] Error:`, error);
    throw new Error(error.message || 'Failed to fetch box score');
  }

  if (data?.error) {
    logger.error(`[useMatchBoxScore] API error:`, data.error);
    throw new Error(data.error);
  }

  logger.debug(`[useMatchBoxScore] Success, source: ${data?.source}`);
  return data as BoxScoreData;
}

export function useMatchBoxScore(stgAzuroId: string | null | undefined) {
  return useQuery({
    queryKey: ['match-boxscore', stgAzuroId],
    queryFn: () => fetchBoxScore(stgAzuroId!),
    enabled: !!stgAzuroId,
    staleTime: Infinity, // Permanent cache - never auto-refetch
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
