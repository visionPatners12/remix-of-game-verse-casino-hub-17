export { useSupabaseMatchData } from './useSupabaseMatchData';
export { useAzuroMarkets } from './useAzuroMarkets';
export { useMatchLineup } from './useMatchLineup';
export { useMatchData } from './useMatchData';
export { useMatchBoxScore } from './useMatchBoxScore';
export { useH2H } from './useH2H';

// Legacy exports for backward compatibility
export { useMatchData as useMatchEvents } from './useMatchData';
export { useMatchData as useMatchStatistics } from './useMatchData';

export type { LineupPlayer, TeamLineup, LineupData } from './useMatchLineup';
export type { 
  MatchEvent, 
  MatchStatistics, 
  TeamStatistics,
  MatchDataResponse,
  MatchVenue,
  MatchReferee,
  MatchForecast 
} from './useMatchData';
export type { BoxScorePlayer, TeamBoxScore, BoxScoreData } from './useMatchBoxScore';
