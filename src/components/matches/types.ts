/**
 * Unified Match Types
 * Single source of truth for all match card displays across the app
 */

import type { RpcMatchItem } from '@/features/sports/types/rpc';

// Unified team info
export interface UniversalTeam {
  id?: string;
  name: string;
  logo?: string | null;
  slug?: string;
}

// Unified sport info
export interface UniversalSport {
  id?: string;
  name: string;
  slug: string;
  icon_name?: string | null;
}

// Unified league info
export interface UniversalLeague {
  id?: string;
  name: string;
  slug?: string;
  logo?: string | null;
}

// Match status
export interface UniversalMatchStatus {
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  isPrematch: boolean;
  statusShort?: string | null;
  statusLong?: string | null;
}

// Score info
export interface UniversalScore {
  home: number;
  away: number;
  breakdown?: { label: string; home: number; away: number }[];
}

/**
 * UniversalMatch - The unified match type used by UnifiedMatchCard
 * Normalized from both RPC and Supabase data sources
 */
export interface UniversalMatch {
  // Identifiers
  id: string;                    // UUID for navigation
  gameId?: string;               // Azuro ID for markets
  stgId?: string;                // Staging ID for reactions

  // Timing
  startIso: string;              // ISO timestamp
  startsAt?: string;             // Unix timestamp string (for compatibility)

  // Teams
  home: UniversalTeam;
  away: UniversalTeam;

  // Context
  sport: UniversalSport;
  league: UniversalLeague;
  country?: { name: string; slug?: string };

  // Match info
  stage?: string | null;
  round?: string | null;
  week?: number | null;

  // Status
  status: UniversalMatchStatus;
  
  // Scores (parsed from states)
  states?: Record<string, unknown> | null;
  score?: UniversalScore;

  // Betting
  turnover?: string | null;
  hasAzuroId: boolean;
}

/**
 * Normalize RpcMatchItem to UniversalMatch
 */
export function normalizeFromRpc(item: RpcMatchItem): UniversalMatch {
  const isLive = item.is_live;
  const isFinished = 
    item.match_status_short === 'FT' || 
    item.match_status_short === 'AET' ||
    item.match_status_short === 'PEN' ||
    item.azuro_state === 'resolved';
  const isPrematch = item.is_prematch;
  const isUpcoming = !isLive && !isFinished;

  return {
    id: item.id,
    gameId: item.azuro_game_id,
    stgId: item.stg_id,
    startIso: item.start_iso,
    startsAt: String(Math.floor(new Date(item.start_iso).getTime() / 1000)),
    home: {
      id: item.home_team_id,
      name: item.home.name,
      logo: item.home.logo,
      slug: item.home.slug,
    },
    away: {
      id: item.away_team_id,
      name: item.away.name,
      logo: item.away.logo,
      slug: item.away.slug,
    },
    sport: {
      id: item.sport_id,
      name: item.sport.name,
      slug: item.sport.slug,
      icon_name: item.sport.icon_name,
    },
    league: {
      id: item.league_id,
      name: item.league.name,
      slug: item.league.slug,
      logo: item.league.logo,
    },
    stage: item.stage,
    round: item.round,
    week: item.week,
    status: {
      isLive,
      isFinished,
      isUpcoming,
      isPrematch,
      statusShort: item.match_status_short,
      statusLong: item.match_status_long,
    },
    states: item.states,
    turnover: item.turnover?.toString(),
    hasAzuroId: !!item.azuro_game_id,
  };
}

/**
 * Supabase game row type (from useSupabaseGames)
 */
interface SupabaseGameRow {
  id: string;
  gameId?: string;
  slug?: string;
  title?: string;
  startsAt?: string;
  state?: string;
  status?: 'inplay' | 'finished' | 'prematch' | string; // PersonalizedMatch format
  is_live?: boolean;      // Boolean flag from useSupabaseGames
  is_prematch?: boolean;  // Boolean flag from useSupabaseGames
  turnover?: string;
  sport?: {
    sportId?: string;
    slug?: string;
    name?: string;
    icon_name?: string | null;
  };
  league?: {
    id?: string;
    name?: string;
    slug?: string;
    logo?: string | null;
  };
  country?: {
    name?: string;
    slug?: string;
  };
  participants?: Array<{
    name: string;
    image?: string | null;
    teamId?: string | null;
  }>;
  matchStates?: Record<string, unknown>;
  stage?: string | null;
  round?: string | null;
  week?: number | null;
}

/**
 * Normalize Supabase game row to UniversalMatch
 */
export function normalizeFromSupabase(row: SupabaseGameRow): UniversalMatch {
  // Prioritize boolean flags (more reliable) over state string
  let isLive: boolean;
  let isPrematch: boolean;
  let isFinished: boolean;
  
  if (row.is_live !== undefined || row.is_prematch !== undefined) {
    // Boolean flags available - simple and reliable logic
    isLive = row.is_live ?? false;
    isPrematch = row.is_prematch ?? false;
    isFinished = !isLive && !isPrematch;  // If not live and not prematch, it's finished
  } else {
    // Fallback to state string
    const rawStatus = row.status || row.state || '';
    const state = rawStatus.toLowerCase();
    isLive = state === 'live' || state === 'inplay';
    isFinished = state === 'finished' || state === 'resolved';
    isPrematch = state === 'prematch';
  }
  
  const isUpcoming = isPrematch && !isFinished;

  const homeParticipant = row.participants?.[0];
  const awayParticipant = row.participants?.[1];

  return {
    id: row.id,
    gameId: row.gameId,
    stgId: row.id,
    startIso: row.startsAt 
      ? (isNaN(Number(row.startsAt)) 
          ? row.startsAt 
          : new Date(Number(row.startsAt) * 1000).toISOString())
      : new Date().toISOString(),
    startsAt: row.startsAt,
    home: {
      id: homeParticipant?.teamId || undefined,
      name: homeParticipant?.name || 'Team A',
      logo: homeParticipant?.image,
    },
    away: {
      id: awayParticipant?.teamId || undefined,
      name: awayParticipant?.name || 'Team B',
      logo: awayParticipant?.image,
    },
    sport: {
      id: row.sport?.sportId,
      name: row.sport?.name || '',
      slug: row.sport?.slug || '',
      icon_name: row.sport?.icon_name,
    },
    league: {
      id: row.league?.id,
      name: row.league?.name || '',
      slug: row.league?.slug,
      logo: row.league?.logo,
    },
    country: row.country ? {
      name: row.country.name || '',
      slug: row.country.slug,
    } : undefined,
    stage: row.stage,
    round: row.round,
    week: row.week,
    status: {
      isLive,
      isFinished,
      isUpcoming,
      isPrematch,
      statusShort: row.state,
      statusLong: undefined,
    },
    states: row.matchStates,
    turnover: row.turnover,
    hasAzuroId: !!row.gameId,
  };
}

/**
 * Type guard to check if input is RpcMatchItem
 */
export function isRpcMatchItem(item: unknown): item is RpcMatchItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'stg_id' in item &&
    'azuro_game_id' in item &&
    'home' in item &&
    'away' in item
  );
}

/**
 * Normalize any match input to UniversalMatch
 */
export function normalizeMatch(input: RpcMatchItem | SupabaseGameRow | UniversalMatch): UniversalMatch {
  // Already normalized
  if ('startIso' in input && 'hasAzuroId' in input) {
    return input as UniversalMatch;
  }
  
  // RPC format
  if (isRpcMatchItem(input)) {
    return normalizeFromRpc(input);
  }
  
  // Supabase format
  return normalizeFromSupabase(input as SupabaseGameRow);
}
