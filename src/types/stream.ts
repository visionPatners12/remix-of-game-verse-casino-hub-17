/**
 * GetStream Activity Types
 * Types for activities received from GetStream before transformation to FeedPost
 */

// Re-export client types
export * from './stream-client';

// ============================================
// Type Definitions
// ============================================

/**
 * User data enriched by GetStream
 */
export interface StreamUserData {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  avatar_url?: string;
}

/**
 * Match data structure in GetStream activities
 */
export interface StreamMatchData {
  id?: string;
  azuroId?: string;
  date?: string;
  startsAt?: string;
  homeName?: string;
  homeTeam?: string;
  homeTeamId?: string;
  homeId?: string;
  awayName?: string;
  awayTeam?: string;
  awayTeamId?: string;
  awayId?: string;
  league?: string | { name: string; slug: string; logo?: string };
  leagueName?: string;
  leagueId?: string;
  league_id?: string;
}

/**
 * Selection data structure in GetStream activities
 */
export interface StreamSelectionData {
  marketType?: string;
  market_type?: string;
  market?: string;
  pick?: string;
  outcome?: string;
  odds: number;
  conditionId?: string;
  condition_id?: string;
  outcomeId?: string;
  outcome_id?: string;
  gameId?: string;
  azuroId?: string;
  azuro_id?: string;
  matchName?: string;
  match_name?: string;
  teamNames?: string;
  team_names?: string;
  league?: string | { name: string; slug: string; logo?: string };
  leagueLogo?: string | null;
  sport?: string | { name: string; slug: string };
  homeTeam?: string;
  home_team?: string;
  awayTeam?: string;
  away_team?: string;
  participants?: Array<{ name: string; image?: string | null }>;
  startsAt?: string;
  starts_at?: string;
}

/**
 * Reaction counts from GetStream
 */
export interface StreamReactionCounts {
  like?: number;
  comment?: number;
  share?: number;
}

/**
 * Own reactions from GetStream
 */
export interface StreamOwnReactions {
  like?: unknown[];
  comment?: unknown[];
}

/**
 * Latest reactions from GetStream
 */
export interface StreamLatestReactions {
  like?: unknown[];
  comment?: unknown[];
}

/**
 * Activity verb types supported by the feed
 */
export type StreamActivityVerb = 'predict' | 'bet' | 'simple_post' | 'opinion' | 'polymarket_predict';

/**
 * Base activity structure from GetStream
 * Used before transformation to FeedPost
 */
export interface StreamActivity {
  id: string;
  verb: StreamActivityVerb;
  time: string;
  object?: string;
  
  // Actor data (enriched by GetStream)
  actor?: {
    data?: StreamUserData;
  };
  user?: StreamUserData;
  
  // Content fields
  content?: string;
  analysis?: string;
  hashtags?: string[];
  
  // Match data (for predictions/bets)
  match?: StreamMatchData;
  selections?: StreamSelectionData[];
  
  // Bet-specific fields
  betAmount?: number;
  currency?: string;
  totalOdds?: number;
  potentialWin?: number;
  bet_type?: string;
  confidence?: number;
  isPremium?: boolean;
  
  // Media
  media?: unknown[];
  
  // Reaction data (enriched by GetStream)
  reaction_counts?: StreamReactionCounts;
  own_reactions?: StreamOwnReactions;
  latest_reactions?: StreamLatestReactions;
}

// ============================================
// Type Guards
// ============================================

const VALID_VERBS: readonly StreamActivityVerb[] = ['predict', 'bet', 'simple_post', 'opinion', 'polymarket_predict'];

/**
 * Check if a value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Check if a value is a valid StreamUserData
 */
export function isStreamUserData(value: unknown): value is StreamUserData {
  if (!isObject(value)) return false;
  return typeof value.id === 'string';
}

/**
 * Check if a value is a valid StreamMatchData
 */
export function isStreamMatchData(value: unknown): value is StreamMatchData {
  if (!isObject(value)) return false;
  // Match data is optional but should have at least one identifying field
  return (
    typeof value.id === 'string' ||
    typeof value.azuroId === 'string' ||
    typeof value.homeName === 'string' ||
    typeof value.homeTeam === 'string'
  );
}

/**
 * Check if a value is a valid StreamSelectionData
 */
export function isStreamSelectionData(value: unknown): value is StreamSelectionData {
  if (!isObject(value)) return false;
  // Selection must have odds as number
  return typeof value.odds === 'number';
}

/**
 * Check if a value is a valid StreamActivityVerb
 */
export function isStreamActivityVerb(value: unknown): value is StreamActivityVerb {
  return typeof value === 'string' && VALID_VERBS.includes(value as StreamActivityVerb);
}

/**
 * Check if a value is a valid StreamActivity
 * This is the main type guard for validating GetStream responses
 */
export function isStreamActivity(value: unknown): value is StreamActivity {
  if (!isObject(value)) return false;
  
  // Required fields
  if (typeof value.id !== 'string') return false;
  if (!isStreamActivityVerb(value.verb)) return false;
  if (typeof value.time !== 'string') return false;
  
  // Optional nested objects validation
  if (value.match !== undefined && !isStreamMatchData(value.match)) return false;
  
  if (value.selections !== undefined) {
    if (!Array.isArray(value.selections)) return false;
    if (!value.selections.every(isStreamSelectionData)) return false;
  }
  
  return true;
}

/**
 * Filter and validate an array of unknown values to StreamActivity[]
 * Logs warnings for invalid items
 */
export function filterValidActivities(
  items: unknown[],
  logWarning?: (message: string, data?: unknown) => void
): StreamActivity[] {
  return items.filter((item, index) => {
    const isValid = isStreamActivity(item);
    if (!isValid && logWarning) {
      logWarning(`[STREAM_GUARD] Invalid activity at index ${index}`, {
        id: isObject(item) ? item.id : 'unknown',
        verb: isObject(item) ? item.verb : 'unknown'
      });
    }
    return isValid;
  }) as StreamActivity[];
}

/**
 * Safely extract user data from an activity
 * More permissive than isStreamUserData to preserve all available fields
 */
export function extractValidUserData(activity: StreamActivity): StreamUserData {
  const userData = activity.actor?.data || activity.user;
  
  // Accept any object with user-like properties - userData is already StreamUserData
  if (userData) {
    return {
      id: String(userData.id || ''),
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      avatar: userData.avatar,
      avatar_url: userData.avatar_url,
    };
  }
  
  return { id: '', username: 'user' };
}

/**
 * Safely extract selections from an activity
 */
export function extractValidSelections(activity: StreamActivity): StreamSelectionData[] {
  if (!activity.selections || !Array.isArray(activity.selections)) {
    return [];
  }
  return activity.selections.filter(isStreamSelectionData);
}
