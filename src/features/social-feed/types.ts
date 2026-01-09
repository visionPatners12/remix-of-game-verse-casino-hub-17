// 🏗️ Social Feed Types - Re-exports from unified types
// This file is kept for backward compatibility during migration

// Re-export all types from the unified feed types
export * from '@/types/feed';

// Re-export FeedFilter explicitly for backward compatibility
export type { FeedFilter } from '@/types/feed/state';

// Additional feature-specific types
export interface TeamNavigationOptions {
  teamName: string;
  onClick?: () => void;
  className?: string;
}

export interface PostActionHandlers {
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export interface AddToTicketState {
  text: string;
  disabled: boolean;
  variant: "outline" | "secondary";
}

// Feed actions interface - properly typed
import type { FeedPost, ReactionCounts, Comment, ReactionHandlers, Author } from '@/types/feed';

export interface FeedActionsInterface {
  handleAddComment: (postId: string, text: string) => Promise<void>;
  toggleComments: (postId: string) => void;
  handleVideoFocus: (postId: string | null) => void;
  reactionHandlers: ReactionHandlers;
  getPostReactions: (post: FeedPost, streamData?: unknown) => ReactionCounts;
  getPostComments: (post: FeedPost) => Comment[];
  user: Author | null;
  handleComment: (postId: string) => void;
  handleLike: (postId: string) => Promise<void>;
  handleUnlike: (postId: string) => Promise<void>;
  loadComments: (post: FeedPost, forceReload?: boolean) => Promise<void>;
}
