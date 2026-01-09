import { z } from 'zod';

/**
 * Reaction Counts Schema - Like/Comment/Share counts for posts
 */
export const ReactionCountsSchema = z.object({
  likes: z.number(),
  comments: z.number(),
  shares: z.number(),
  userLiked: z.boolean(),
});

export type ReactionCounts = z.infer<typeof ReactionCountsSchema>;

/**
 * Reaction Handlers - Callbacks for user interactions
 */
export interface ReactionHandlers {
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

/**
 * Reaction User Schema - User info from GetStream reactions
 */
export const ReactionUserSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export type ReactionUser = z.infer<typeof ReactionUserSchema>;

/**
 * Stream Reaction Data - GetStream reaction structure
 */
export const StreamReactionDataSchema = z.object({
  reaction_counts: z.object({
    like: z.number().optional(),
    comment: z.number().optional(),
    share: z.number().optional(),
  }).optional(),
  own_reactions: z.object({
    like: z.array(ReactionUserSchema).optional(),
    comment: z.array(ReactionUserSchema).optional(),
  }).optional(),
  latest_reactions: z.object({
    like: z.array(ReactionUserSchema).optional(),
    comment: z.array(ReactionUserSchema).optional(),
  }).optional(),
});

export type StreamReactionData = z.infer<typeof StreamReactionDataSchema>;
