import type { FeedPost, ReactionCounts, Comment, ReactionHandlers } from '@/types/feed';

/**
 * Common props interface for all post types
 * Ensures consistency across different post components
 */
export interface BasePostProps {
  post: FeedPost;
  reactions: ReactionCounts;
  comments: Comment[];
  showComments: boolean;
  isLoadingComments: boolean;
  onAddComment: (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => void;
  onToggleComments: () => void;
  reactionHandlers: ReactionHandlers;
  /** Called when user clicks on the post to open focus mode */
  onFocusPost?: () => void;
}

/**
 * Factory function type for creating post components
 */
export type PostComponentFactory = (props: BasePostProps) => JSX.Element;

/**
 * Post type mapping for factory function
 */
export interface PostTypeMapping {
  simple: PostComponentFactory;
  prediction: PostComponentFactory;
  bet: PostComponentFactory;
  opinion: PostComponentFactory;
}