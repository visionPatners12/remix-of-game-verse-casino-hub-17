/**
 * Types for rpc_user_feed PostgreSQL function responses
 */

export interface RpcTeamData {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
}

export interface RpcLeagueData {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
}

export interface RpcSportData {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
}

export interface RpcHighlightMatchData {
  id: string;
  highlightly_id: number;
  starts_at: string;
  status: string | null;
  status_short: string | null;
  status_long: string | null;
  states: Record<string, unknown> | null;
  week: number | null;
  stage: string | null;
  round: string | null;
  venue: string | null;
  referee: string | null;
}

export interface RpcMatchData {
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
  sport: RpcSportData;
  home: RpcTeamData;
  away: RpcTeamData;
  league: RpcLeagueData;
}

export interface RpcHighlightData {
  id: string; // UUID from highlights table
  highlightly_id: number;
  type: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  embed_url: string | null;
  thumbnails: Record<string, unknown> | null;
  duration_seconds: number | null;
  source: string | null;
  channel: Record<string, unknown> | null;
  match_highlightly_id: number | null;
  match_date: string | null;
  match: RpcHighlightMatchData | null;
  home: RpcTeamData | null;
  away: RpcTeamData | null;
  league: RpcLeagueData | null;
}

export interface RpcUserFeedItem {
  item_type: 'match' | 'highlight';
  item_id: string;
  rn: number;
  ts: string;
  sport_id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  pref_id: string;
  pref_entity_type: 'sport' | 'league' | 'team' | 'player';
  pref_position: number;
  data: RpcMatchData | RpcHighlightData;
}

export interface RpcUserFeedParams {
  p_user_id?: string | null;
  p_limit?: number;
  p_cursor_rn?: number | null;
  p_cursor_type?: string | null;
  p_cursor_id?: string | null;
  p_highlight_first?: boolean;
  p_now?: string;
  p_match_past?: string;
  p_match_future?: string;
  p_highlight_past?: string;
}

export interface RpcUserFeedCursor {
  rn: number;
  type: string;
  id: string;
}
