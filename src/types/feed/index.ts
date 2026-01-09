/**
 * Feed Types - Single Source of Truth
 * 
 * All feed-related types are defined here.
 * Other type files (src/types/posts/, src/types/social-feed.ts) re-export from here.
 */

// Core types
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
} from '../core';

// Content schemas
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
} from './content';

// Post types
export {
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
} from './post';

// State types
export type {
  FeedState,
  FeedError,
  FeedConfiguration,
  FeedFilter,
} from './state';

// Registry types
export type {
  PostComponentProps,
  PostComponent,
  PostTypeConfig,
  UnifiedPostRegistry,
  PostTypePlugin,
  PluginRegistry,
} from './registry';
