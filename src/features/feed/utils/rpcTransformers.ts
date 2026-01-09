/**
 * Transform functions for rpc_user_feed data to HybridFeedItem format
 */

import type { 
  RpcUserFeedItem, 
  RpcMatchData, 
  RpcHighlightData 
} from '../types/rpcUserFeed';
import type { PersonalizedMatch, HybridFeedItem } from '@/types/hybrid-feed';
import type { PersonalizedHighlight } from '@/features/highlights/hooks/usePersonalizedHighlights';
import type { Highlight } from '@/features/highlights/types';

// Finished status values from the database
const FINISHED_STATUSES = [
  'FT', 'AET', 'PEN', 'AWD', 'WO', 'CANC', 'ABD', 'INT', 'POSTP',
  'Finished', 'Finished after penalties', 'Finished after extra time',
  'Awarded', 'Cancelled', 'Abandoned'
];

/**
 * Check if a status string indicates a finished match
 */
function isFinishedStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return FINISHED_STATUSES.some(s => 
    status.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase() === status.toLowerCase()
  );
}

/**
 * Extract scores from the states object (varies by sport)
 */
function extractScoresFromStates(states: Record<string, unknown> | null): { home: number; away: number } | null {
  if (!states) return null;
  
  // Try common score fields
  const homeScore = states.home_score ?? states.homeScore ?? states.localteam_score ?? 0;
  const awayScore = states.away_score ?? states.awayScore ?? states.visitorteam_score ?? 0;
  
  if (typeof homeScore === 'number' && typeof awayScore === 'number') {
    return { home: homeScore, away: awayScore };
  }
  
  return null;
}

/**
 * Map preference entity type to a match reason
 */
function mapPrefTypeToReason(prefType: string): PersonalizedHighlight['matchReason'] {
  switch (prefType) {
    case 'team': return 'favorite_team';
    case 'league': return 'favorite_league';
    case 'sport': return 'favorite_sport';
    default: return 'recent';
  }
}

/**
 * Determine match status: 'inplay' | 'finished' | 'prematch'
 * Includes time-based validation for stale "live" matches
 */
function determineMatchStatus(data: RpcMatchData): 'inplay' | 'finished' | 'prematch' {
  // Check finished status first
  if (isFinishedStatus(data.match_status_long) || isFinishedStatus(data.match_status_short)) {
    return 'finished';
  }
  
  // For "live" matches, validate with time check (max 4 hours)
  if (data.is_live) {
    const startTime = new Date(data.start_iso).getTime();
    const now = Date.now();
    const maxLiveDuration = 4 * 60 * 60 * 1000; // 4 hours
    
    // If match started more than 4h ago, treat as finished (stale data)
    if (now - startTime > maxLiveDuration) {
      return 'finished';
    }
    return 'inplay';
  }
  
  return 'prematch';
}

/**
 * Transform RPC match item to PersonalizedMatch
 */
export function transformRpcMatchToPersonalizedMatch(rpcItem: RpcUserFeedItem): PersonalizedMatch {
  const data = rpcItem.data as RpcMatchData;
  const status = determineMatchStatus(data);
  const scores = extractScoresFromStates(data.states);
  
  return {
    id: data.stg_id,
    gameId: data.azuro_game_id,
    startsAt: data.start_iso,
    status,
    participants: [
      { name: data.home?.name || 'TBD', image: data.home?.logo || undefined },
      { name: data.away?.name || 'TBD', image: data.away?.logo || undefined }
    ],
    sport: { 
      sportId: rpcItem.sport_id,
      slug: data.sport?.slug,
      icon_name: data.sport?.icon_name
    },
    league: { 
      id: data.league?.id,
      name: data.league?.name || '',
      slug: data.league?.slug,
      logo: data.league?.logo || undefined 
    },
    scores: scores ? {
      localteam_score: scores.home,
      visitorteam_score: scores.away
    } : undefined,
    matchStates: data.states || undefined,
    stage: data.stage,
    round: data.round
  };
}

/**
 * Transform RPC highlight item to PersonalizedHighlight
 */
export function transformRpcHighlightToPersonalizedHighlight(rpcItem: RpcUserFeedItem): PersonalizedHighlight {
  const data = rpcItem.data as RpcHighlightData;
  
  // Build base Highlight object
  const highlight: Highlight = {
    id: rpcItem.item_id,
    highlightly_id: data.highlightly_id,
    provider: 'highlightly',
    type: data.type || 'UNVERIFIED',
    title: data.title,
    description: data.description,
    video_url: data.video_url,
    embed_url: data.embed_url,
    image_url: data.image_url,
    duration_seconds: data.duration_seconds,
    source: data.source,
    sport_id: rpcItem.sport_id,
    league_id: rpcItem.league_id,
    home_team_id: rpcItem.home_team_id,
    away_team_id: rpcItem.away_team_id,
    league_highlightly_id: null,
    home_team_highlightly_id: null,
    away_team_highlightly_id: null,
    match_highlightly_id: data.match_highlightly_id,
    geo_allowed_countries: null,
    geo_blocked_countries: null,
    geo_embeddable: null,
    geo_state: null,
    thumbnails: data.thumbnails,
    channel: data.channel,
    raw: data, // Store original RPC data for transformers
    created_at: rpcItem.ts,
    updated_at: rpcItem.ts,
    // Relations
    league: data.league ? {
      id: data.league.id,
      name: data.league.name,
      logo: data.league.logo,
      slug: data.league.slug
    } : undefined,
    home_team: data.home ? {
      id: data.home.id,
      name: data.home.name,
      logo: data.home.logo,
      abbreviation: data.home.slug // Use slug as abbreviation fallback
    } : undefined,
    away_team: data.away ? {
      id: data.away.id,
      name: data.away.name,
      logo: data.away.logo,
      abbreviation: data.away.slug // Use slug as abbreviation fallback
    } : undefined,
    match: data.match ? {
      id: data.match.id,
      starts_at: data.match.starts_at,
      score: data.match.states,
      stage: data.match.stage,
      round: data.match.round
    } : undefined
  };

  return {
    ...highlight,
    relevanceScore: rpcItem.pref_position,
    matchReason: mapPrefTypeToReason(rpcItem.pref_entity_type)
  };
}

/**
 * Transform a single RPC item to HybridFeedItem
 */
export function transformRpcItemToHybridFeedItem(rpcItem: RpcUserFeedItem): HybridFeedItem {
  if (rpcItem.item_type === 'match') {
    return {
      type: 'match',
      data: transformRpcMatchToPersonalizedMatch(rpcItem),
      id: `match-${rpcItem.item_id}`,
      ts: rpcItem.ts
    };
  } else {
    return {
      type: 'highlight',
      data: transformRpcHighlightToPersonalizedHighlight(rpcItem),
      id: `highlight-${rpcItem.item_id}`,
      ts: rpcItem.ts
    };
  }
}

/**
 * Transform array of RPC items to HybridFeedItem array
 */
export function transformRpcItemsToFeed(rpcItems: RpcUserFeedItem[]): HybridFeedItem[] {
  return rpcItems.map(transformRpcItemToHybridFeedItem);
}
