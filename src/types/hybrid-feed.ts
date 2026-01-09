import type { FeedPost } from '@/types/feed';
import type { PersonalizedHighlight } from '@/features/highlights/hooks/usePersonalizedHighlights';

/**
 * Match data for personalized match cards in the hybrid feed
 * Compatible with MatchData type from sports/types
 */
export interface PersonalizedMatch {
  id: string;
  gameId: string;
  startsAt?: string;
  status?: string;
  participants?: Array<{
    name: string;
    image?: string;
  }>;
  sport?: {
    sportId?: string;
    slug?: string;
    icon_name?: string | null;
  };
  league?: {
    id?: string;
    name?: string;
    slug?: string;
    logo?: string;
  };
  scores?: {
    localteam_score?: number;
    visitorteam_score?: number;
  };
  /** Full states object for detailed score breakdown (periods, sets, etc.) */
  matchStates?: Record<string, unknown>;
  stage?: string | null;
  round?: string | null;
}

/**
 * Union type for all items that can appear in the hybrid feed
 */
export type HybridFeedItem = 
  | { type: 'stream'; data: FeedPost; id: string }
  | { type: 'highlight'; data: PersonalizedHighlight; id: string; ts?: string }
  | { type: 'match'; data: PersonalizedMatch; id: string; ts?: string };

/**
 * Configuration for hybrid feed interleaving
 */
export interface HybridFeedConfig {
  streamPostsPerPersonalized: number; // Number of stream posts between personalized content
  prioritizeHighlights: boolean; // Whether to show highlights before matches
}

export const DEFAULT_HYBRID_FEED_CONFIG: HybridFeedConfig = {
  streamPostsPerPersonalized: 3,
  prioritizeHighlights: true,
};
