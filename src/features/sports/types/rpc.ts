/**
 * Types for RPC match data structure
 * Aligned with the new RPC function response format
 */

// Sport object from RPC
export interface RpcSportInfo {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
}

// Team object from RPC
export interface RpcTeamInfo {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
}

// League object from RPC
export interface RpcLeagueInfo {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
}

/**
 * Main type for a match item from RPC
 * Maps directly to the jsonb_build_object structure
 */
export interface RpcMatchItem {
  // Global identifier
  id: string;
  item_type: 'match';
  
  // Azuro / staging
  stg_id: string;
  azuro_game_id: string;
  azuro_state: string;
  is_live: boolean;
  is_prematch: boolean;
  start_iso: string;
  turnover: number | null;
  conditions_count: number | null;
  
  // Match (if linked)
  match_id: string | null;
  match_status: string | null;
  match_status_short: string | null;
  match_status_long: string | null;
  states: Record<string, unknown> | null;
  week: number | null;
  stage: string | null;
  round: string | null;
  
  // Entity IDs
  sport_id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  
  // Enriched objects
  sport: RpcSportInfo;
  home: RpcTeamInfo;
  away: RpcTeamInfo;
  league: RpcLeagueInfo;
}

/**
 * Helper type for match status checks
 */
export interface MatchStatusInfo {
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  isPrematch: boolean;
}

/**
 * Get match status from RpcMatchItem
 */
export function getMatchStatus(match: RpcMatchItem): MatchStatusInfo {
  const isLive = match.is_live;
  const isFinished = 
    match.match_status_short === 'FT' || 
    match.match_status_short === 'AET' ||
    match.match_status_short === 'PEN' ||
    match.azuro_state === 'resolved';
  const isPrematch = match.is_prematch;
  const isUpcoming = !isLive && !isFinished;
  
  return { isLive, isFinished, isUpcoming, isPrematch };
}
