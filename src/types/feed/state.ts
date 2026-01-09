import type { Comment } from '../core';
import type { FeedPost } from './post';

/**
 * Feed State - UI state for feed display
 */
export interface FeedState {
  posts: FeedPost[];
  comments: Record<string, Comment[]>;
  expandedComments: Record<string, boolean>;
  focusedPostId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Feed Error - Typed error structure
 */
export interface FeedError {
  type: 'NETWORK' | 'VALIDATION' | 'AUTH' | 'UNKNOWN';
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Feed Configuration
 */
export interface FeedConfiguration {
  limit: number;
  includesPredictions: boolean;
  includesOpinions: boolean;
  includesReposts: boolean;
}

/**
 * Feed Filter Type
 */
export type FeedFilter = 'foryou' | 'orders' | 'forecasts' | 'highlights' | 'trending' | 'live';
