/**
 * Post Types - Re-exports from canonical location
 * 
 * CANONICAL SOURCE: src/types/feed/
 * This file exists for backward compatibility with existing imports.
 * All types are now defined in src/types/feed/
 */

// Re-export everything from feed types (canonical source)
export {
  // Post types
  POST_TYPES,
  FeedPostSchema,
  isPredictionPost,
  isBetPost,
  isOpinionPost,
  isHighlightPost,
  isSimplePost,
  isLiveEventPost,
  isPolymarketPredictionPost,
  type PostType,
  type FeedPost,
  type TypedPost,
  type SimplePost,
  type PredictionPost,
  type OpinionPost,
  type BetPost,
  type HighlightPost,
  type LiveEventPost,
  type PolymarketPredictionPost,
} from '@/types/feed/post';

// Re-export content types
export {
  BetTypeSchema,
  SelectionSchema,
  MatchSchema,
  PredictionDataSchema,
  BetDataSchema,
  OpinionDataSchema,
  HighlightDataSchema,
  HighlightContentSchema,
  LiveEventContentSchema,
  SimpleContentSchema,
  PolymarketPredictionContentSchema,
  LEGACY_BET_TYPE_MAP,
  normalizeBetType,
  type BetType,
  type Selection,
  type Match,
  type PredictionData,
  type BetData,
  type OpinionData,
  type HighlightData,
  type HighlightContent,
  type LiveEventContent,
  type SimpleContent,
  type PolymarketPredictionContent,
} from '@/types/feed/content';

// Re-export core types
export {
  AuthorSchema,
  ReactionCountsSchema,
  CommentSchema,
  MediaItemSchema,
  ReactionUserSchema,
  StreamReactionDataSchema,
  type Author,
  type ReactionCounts,
  type ReactionHandlers,
  type Comment,
  type MediaItem,
  type MediaGridProps,
  type ReactionUser,
  type StreamReactionData,
} from '@/types/core';

// Re-export registry types
export type {
  PostComponentProps,
  PostComponent,
  PostTypeConfig,
  UnifiedPostRegistry,
  PostTypePlugin,
  PluginRegistry,
} from '@/types/feed/registry';

// Legacy compatibility aliases
export type { FeedPost as Post } from '@/types/feed/post';
