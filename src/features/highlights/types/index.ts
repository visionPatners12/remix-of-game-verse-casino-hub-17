/**
 * Highlight types from Supabase
 */

// Export RPC response types
export type { GetHighlightsResponse } from './rpc';

// Re-export score types for convenience
export type { HighlightMatchScore, ParsedScore } from '../utils/parseScore';
export { parseHighlightScore } from '../utils/parseScore';

export interface Highlight {
  id: string;
  highlightly_id: number;
  provider: 'highlightly' | string;
  type: 'VERIFIED' | 'UNVERIFIED' | string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  embed_url: string | null;
  duration_seconds: number | null;
  source: string | null;
  
  // UUID foreign keys to sports_data
  sport_id: string;
  league_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  
  // Highlightly IDs for reference
  league_highlightly_id: number | null;
  home_team_highlightly_id: number | null;
  away_team_highlightly_id: number | null;
  match_highlightly_id: number | null;
  
  geo_allowed_countries: string[] | null;
  geo_blocked_countries: string[] | null;
  geo_embeddable: boolean | null;
  geo_state: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thumbnails: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channel: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Relations enrichies
  league?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  };
  home_team?: {
    id: string;
    name: string;
    logo: string | null;
    abbreviation: string | null;
  };
  away_team?: {
    id: string;
    name: string;
    logo: string | null;
    abbreviation: string | null;
  };
  match?: {
    id: string;
    starts_at: string;
    score: import('../utils/parseScore').HighlightMatchScore | null;
    stage?: string | null;
    round?: string | null;
  };
}
