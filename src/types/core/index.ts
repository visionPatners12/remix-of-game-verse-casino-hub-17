/**
 * Core Types - Single Source of Truth
 * Base types used across the entire application
 */

// Author
export { AuthorSchema, type Author } from './author';

// Reactions
export {
  ReactionCountsSchema,
  ReactionUserSchema,
  StreamReactionDataSchema,
  type ReactionCounts,
  type ReactionHandlers,
  type ReactionUser,
  type StreamReactionData,
} from './reactions';

// Comments
export { CommentSchema, type Comment } from './comments';

// Media
export { MediaItemSchema, type MediaItem, type MediaGridProps } from './media';
