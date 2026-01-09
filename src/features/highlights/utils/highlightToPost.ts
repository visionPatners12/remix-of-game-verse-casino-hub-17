import type { GetHighlightsResponse } from '../types/rpc';
import type { Highlight } from '../types';
import type { RpcHighlightData } from '@/features/feed/types/rpcUserFeed';
import type { HighlightPost } from '@/types/posts';

/** Legacy format input (from get_highlights RPC or direct query) */
type LegacyHighlightInput = (GetHighlightsResponse | Highlight) & { match_date?: string };

/** RPC format input (from rpc_user_feed) */
interface RpcHighlightInput {
  itemId: string;
  ts: string;
  data: RpcHighlightData;
}

/** Check if input is RPC format */
function isRpcFormat(input: unknown): input is RpcHighlightInput {
  return typeof input === 'object' && input !== null && 'itemId' in input && 'data' in input;
}

/** Normalize YouTube URLs to embed format */
function normalizeYouTubeUrl(url: string): string {
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}

/** Map highlight type to post highlight type */
function mapHighlightType(type: string): 'goal' | 'summary' | 'stat' | 'news' {
  switch (type.toLowerCase()) {
    case 'goal':
      return 'goal';
    case 'highlights':
    case 'recap':
      return 'summary';
    default:
      return 'summary';
  }
}

/** Format duration from seconds to MM:SS */
function formatDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds) return undefined;
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

/**
 * Unified transform function for highlight data into HighlightPost
 * Handles both RPC format (from rpc_user_feed) and legacy format (from get_highlights)
 */
export function transformHighlightToPost(
  input: LegacyHighlightInput | RpcHighlightInput
): HighlightPost {
  // Detect format and normalize data
  const isRpc = isRpcFormat(input);
  
  // Extract common fields based on format
  const id = isRpc ? input.itemId : input.id;
  const timestamp = isRpc 
    ? (input.data.match_date || input.ts) 
    : (input.match_date || input.created_at);
  
  // Normalize team data (RPC uses home/away, legacy uses home_team/away_team)
  const homeTeam = isRpc 
    ? input.data.home 
    : (input as LegacyHighlightInput).home_team;
  const awayTeam = isRpc 
    ? input.data.away 
    : (input as LegacyHighlightInput).away_team;
  
  // Get abbreviation (RPC uses slug, legacy uses abbreviation)
  const homeAbbr = isRpc 
    ? input.data.home?.slug 
    : (input as LegacyHighlightInput).home_team?.abbreviation;
  const awayAbbr = isRpc 
    ? input.data.away?.slug 
    : (input as LegacyHighlightInput).away_team?.abbreviation;

  // Common data reference
  const data = isRpc ? input.data : input;

  // Build author from league (official content)
const league = isRpc ? (input as RpcHighlightInput).data.league : (data as LegacyHighlightInput).league;
  
  // Build author from league - use slug as fallback for name, format it nicely
  const leagueName = league?.name || (league?.slug ? league.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null);
  
  const author = (league && (league.name || league.slug)) ? {
    id: league.id || 'unknown',
    username: league.slug || 'highlights',
    fullName: leagueName || 'Highlights',
    avatar: league.logo || '/placeholder.svg',
  } : {
    id: 'system-highlights',
    username: 'highlights',
    fullName: 'Highlights',
    avatar: '/placeholder.svg',
  };

  // Build match info with stage and round
  // Use fixture_id for navigation (from legacy format) or match.id (from RPC)
  const fixtureId = isRpc 
    ? data.match?.id 
    : (data as any).fixture_id || data.match?.id;
  
  const matchInfo = (homeTeam?.name && awayTeam?.name) ? {
    id: data.match?.id || '',
    fixtureId: fixtureId || null, // UUID for match navigation
    homeTeam: homeTeam.name,
    homeTeamId: homeTeam.id || null, // UUID for team navigation
    homeTeamLogo: homeTeam.logo,
    homeTeamAbbr: homeAbbr,
    awayTeam: awayTeam.name,
    awayTeamId: awayTeam.id || null, // UUID for team navigation
    awayTeamLogo: awayTeam.logo,
    awayTeamAbbr: awayAbbr,
    league: league?.name || '',
    leagueLogo: league?.logo || null,
    startsAt: (data.match as any)?.starts_at || data.match_date,
    score: (data.match as any)?.score || (data.match as any)?.states?.score?.current || null,
    stage: data.match?.stage || null,
    round: data.match?.round || null,
  } : null;

  // Build video data - KISS: prioritize embed_url, fallback to video_url
  const videoUrl = data.embed_url || data.video_url || '';
  const videoData = videoUrl
    ? {
        id: String(data.highlightly_id || id),
        url: normalizeYouTubeUrl(videoUrl),
        thumbnail: data.image_url || undefined,
      }
    : undefined;

  // Get title for content - prefer title over description
  const title = data.title || '';
  const description = data.description || '';
  const content = title || description;

  return {
    id,
    type: 'highlight',
    author,
    timestamp,
    content,
    reactions: {
      likes: 0,
      comments: 0,
      shares: 0,
      userLiked: false
    },
    activityId: id,
    hashtags: [],
    media: [],
    highlightContent: {
      type: mapHighlightType(data.type),
      match: matchInfo,
      data: data.duration_seconds 
        ? { duration: formatDuration(data.duration_seconds) }
        : undefined,
      video: videoData,
    },
  };
}

/**
 * Transform RPC highlight data - convenience wrapper for backward compatibility
 */
export function transformRpcHighlightToPost(
  itemId: string,
  ts: string,
  data: RpcHighlightData
): HighlightPost {
  return transformHighlightToPost({ itemId, ts, data });
}
