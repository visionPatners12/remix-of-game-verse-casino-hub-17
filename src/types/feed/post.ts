import { z } from 'zod';
import {
  AuthorSchema,
  ReactionCountsSchema,
  StreamReactionDataSchema,
  MediaItemSchema,
} from '../core';
import {
  PredictionDataSchema,
  BetDataSchema,
  OpinionDataSchema,
  HighlightContentSchema,
  LiveEventContentSchema,
  SimpleContentSchema,
  PolymarketPredictionContentSchema,
  type SimpleContent,
  type PredictionData,
  type BetData,
  type OpinionData,
  type HighlightContent,
  type LiveEventContent,
  type PolymarketPredictionContent,
} from './content';

/**
 * Post Types - Unified enum
 */
export const POST_TYPES = {
  SIMPLE: 'simple',
  PREDICTION: 'prediction',
  OPINION: 'opinion',
  BET: 'bet',
  HIGHLIGHT: 'highlight',
  LIVE_EVENT: 'live_event',
  POLYMARKET_PREDICTION: 'polymarket_prediction',
} as const;

export type PostType = typeof POST_TYPES[keyof typeof POST_TYPES];

/**
 * FeedPost Schema - Single Source of Truth
 * This is the canonical schema for all feed posts
 */
export const FeedPostSchema = z.object({
  id: z.string(),
  type: z.enum(['simple', 'prediction', 'opinion', 'bet', 'highlight', 'live_event', 'polymarket_prediction']),
  author: AuthorSchema,
  content: z.string(),
  timestamp: z.string(),
  reactions: ReactionCountsSchema,
  activityId: z.string(),
  tags: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
  media: z.array(MediaItemSchema).default([]),
  isPremium: z.boolean().optional(),
  
  // Type-specific content - Primary naming convention
  prediction: PredictionDataSchema.optional(),
  bet: BetDataSchema.optional(),
  opinion: OpinionDataSchema.optional(),
  highlight: HighlightContentSchema.optional(),
  liveEvent: LiveEventContentSchema.optional(),
  simplePost: SimpleContentSchema.optional(),
  polymarketPrediction: PolymarketPredictionContentSchema.optional(),
  
  // Legacy aliases - Maintained for backward compatibility
  predictionContent: PredictionDataSchema.optional(),
  betContent: BetDataSchema.optional(),
  opinionContent: OpinionDataSchema.optional(),
  highlightContent: HighlightContentSchema.optional(),
  liveEventContent: LiveEventContentSchema.optional(),
  simpleContent: SimpleContentSchema.optional(),
  polymarketPredictionContent: PolymarketPredictionContentSchema.optional(),
  
  // GetStream reaction data
  streamReactionData: StreamReactionDataSchema.optional(),
});

export type FeedPost = z.infer<typeof FeedPostSchema>;

/**
 * Type-specific post interfaces
 * Use these for discriminated union pattern
 */
export interface SimplePost extends Omit<FeedPost, 'type'> {
  type: 'simple';
  simplePost?: SimpleContent;
  simpleContent?: SimpleContent;
}

export interface PredictionPost extends Omit<FeedPost, 'type'> {
  type: 'prediction';
  prediction?: PredictionData;
  predictionContent?: PredictionData;
}

export interface OpinionPost extends Omit<FeedPost, 'type'> {
  type: 'opinion';
  opinion?: OpinionData;
  opinionContent?: OpinionData;
}

export interface BetPost extends Omit<FeedPost, 'type'> {
  type: 'bet';
  bet?: BetData;
  betContent?: BetData;
}

export interface HighlightPost extends Omit<FeedPost, 'type'> {
  type: 'highlight';
  highlight?: HighlightContent;
  highlightContent?: HighlightContent;
}

export interface LiveEventPost extends Omit<FeedPost, 'type'> {
  type: 'live_event';
  liveEvent?: LiveEventContent;
  liveEventContent?: LiveEventContent;
}

export interface PolymarketPredictionPost extends Omit<FeedPost, 'type'> {
  type: 'polymarket_prediction';
  polymarketPrediction?: PolymarketPredictionContent;
  polymarketPredictionContent?: PolymarketPredictionContent;
}

/**
 * Union type for discriminated unions
 */
export type TypedPost = SimplePost | PredictionPost | OpinionPost | BetPost | HighlightPost | LiveEventPost | PolymarketPredictionPost;

/**
 * Type guards
 */
export const isPredictionPost = (post: FeedPost): post is PredictionPost =>
  post.type === 'prediction';

export const isBetPost = (post: FeedPost): post is BetPost =>
  post.type === 'bet';

export const isOpinionPost = (post: FeedPost): post is OpinionPost =>
  post.type === 'opinion';

export const isHighlightPost = (post: FeedPost): post is HighlightPost =>
  post.type === 'highlight';

export const isSimplePost = (post: FeedPost): post is SimplePost =>
  post.type === 'simple';

export const isLiveEventPost = (post: FeedPost): post is LiveEventPost =>
  post.type === 'live_event';

export const isPolymarketPredictionPost = (post: FeedPost): post is PolymarketPredictionPost =>
  post.type === 'polymarket_prediction';
