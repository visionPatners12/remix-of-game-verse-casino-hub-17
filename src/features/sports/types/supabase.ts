/**
 * Supabase-specific types for sports data
 * Eliminates 'any' types in hooks and components
 */

// Game states from Azuro
export type GameState = 'live' | 'prematch' | 'finished' | 'resolved' | 'canceled';
export type NormalizedGameState = 'Live' | 'Prematch' | 'Finished' | 'Resolved' | 'Canceled';

// Score details structure from sports_data.match.states
export interface ScoreDetails {
  firstHalf?: string;
  secondHalf?: string;
  extraTime?: string;
  penalties?: string;
  firstPeriod?: string;
  secondPeriod?: string;
  thirdPeriod?: string;
  fourthPeriod?: string;
  overtimePeriod?: string;
  firstOvertimePeriod?: string;
  firstSet?: string;
  secondSet?: string;
  thirdSet?: string;
  fourthSet?: string;
  fifthSet?: string;
  home?: { innings?: number[] };
  away?: { innings?: number[] };
}

// Match states structure from sports_data.match table
export interface MatchStatesScore {
  current?: string;
  // Basketball quarters
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  overTime?: string;
  // Hockey/Football periods
  firstPeriod?: string;
  secondPeriod?: string;
  thirdPeriod?: string;
  fourthPeriod?: string;
  overtimePeriod?: string;
  firstOvertimePeriod?: string;
  // Soccer halves
  firstHalf?: string;
  secondHalf?: string;
  extraTime?: string;
  penalties?: string;
  // Volleyball sets
  firstSet?: string;
  secondSet?: string;
  thirdSet?: string;
  fourthSet?: string;
  fifthSet?: string;
  // Baseball innings
  home?: { innings?: number[]; hits?: number; errors?: number };
  away?: { innings?: number[]; hits?: number; errors?: number };
  // Allow dynamic access
  [key: string]: string | { innings?: number[]; hits?: number; errors?: number } | undefined;
}

export interface MatchStates {
  score?: string | MatchStatesScore;
  scoreDetails?: ScoreDetails;
  teams?: {
    home?: { score?: string };
    away?: { score?: string };
  };
}

// FK join types for stg_azuro_games query
export interface TeamJoin {
  id: string;
  name: string;
  display_name?: string;
  slug: string;
  logo?: string;
}

export interface SportJoin {
  id: string;
  slug: string;
  name: string;
  azuro_id?: number;
  icon_name?: string;
}

export interface MatchJoin {
  id: string;
  states?: MatchStates;
  stage?: string;
  round?: string;
  week?: string;
}

export interface LeagueJoin {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

// Payload structure for fallback data
export interface GamePayload {
  participants?: Array<{
    name?: string;
    image?: string;
  }>;
}

// Row type from stg_azuro_games with FK joins
export interface SupabaseGameRow {
  id: string;
  azuro_game_id?: string;
  sport_id?: string;
  league_id?: string;
  match_id?: string;
  home_team_id?: string;
  away_team_id?: string;
  slug?: string;
  title?: string;
  turnover?: number;
  home?: string;
  away?: string;
  league?: string;
  league_azuro_slug?: string;
  country_name?: string;
  start_iso?: string;
  state?: GameState;
  is_prematch?: boolean;
  is_live?: boolean;
  payload?: GamePayload;
  // FK joins
  home_team?: TeamJoin | null;
  away_team?: TeamJoin | null;
  sport?: SportJoin | null;
  match?: MatchJoin | null;
  league_fk?: LeagueJoin | null;
}

// Simplified row type for leagues navigation
export interface LeagueGameRow {
  league: string;
  country_name?: string;
  league_azuro_slug: string;
  league_id?: string;
  start_iso?: string;
}

// Match type with status_long for filtering
export interface MatchWithStatusLong {
  status_long?: string;
  [key: string]: unknown;
}
