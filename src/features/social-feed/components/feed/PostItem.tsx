import React, { memo, useMemo, useCallback } from 'react';
import { createPostComponent } from '../posts';
import type { BasePostProps } from '../posts/base/BasePostProps';
import type { FeedPost, ReactionHandlers, ReactionCounts, Comment } from '@/types/feed';

interface PostItemProps {
  post: FeedPost;
  isDetailView: boolean;
  expandedComments: boolean;
  isLoadingComments: boolean;
  onFocusPost: (postId: string | null) => void;
  onAddComment: (post: FeedPost, text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => Promise<void>;
  onToggleComments: (postId: string) => void;
  createReactionHandlers: (post: FeedPost) => ReactionHandlers;
  getPostReactions: (post: FeedPost) => ReactionCounts;
  getPostComments: (post: FeedPost) => Comment[];
}

/**
 * Memoized post item wrapper - prevents re-renders when other posts change
 * PERF: Uses stable keys and memoized derived data
 */
export const PostItem = memo(function PostItem({
  post,
  isDetailView,
  expandedComments,
  isLoadingComments,
  onFocusPost,
  onAddComment,
  onToggleComments,
  createReactionHandlers,
  getPostReactions,
  getPostComments,
}: PostItemProps) {
  // Memoize handlers that depend on this specific post
  const reactionHandlers = useMemo(
    () => createReactionHandlers(post),
    [createReactionHandlers, post]
  );

  const reactions = useMemo(
    () => getPostReactions(post),
    [getPostReactions, post]
  );

  const comments = useMemo(
    () => getPostComments(post),
    [getPostComments, post]
  );

  const handleAddComment = useCallback(
    (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => onAddComment(post, text, gif),
    [onAddComment, post]
  );

  const handleToggleComments = useCallback(
    () => onToggleComments(post.id),
    [onToggleComments, post.id]
  );

  const handlePostClick = useCallback((e: React.MouseEvent) => {
    if (isDetailView) return;
    
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button, a, input, textarea, [role="button"]');
    
    if (!isInteractiveElement) {
      onFocusPost(post.id);
    }
  }, [isDetailView, onFocusPost, post.id]);

  const postProps: BasePostProps = useMemo(() => ({
    post,
    reactions,
    comments,
    showComments: expandedComments,
    isLoadingComments,
    onAddComment: handleAddComment,
    onToggleComments: handleToggleComments,
    reactionHandlers
  }), [post, reactions, comments, expandedComments, isLoadingComments, handleAddComment, handleToggleComments, reactionHandlers]);

  // DRY approach: base class + modifier (BEM-like convention)
  const postVariantClass = {
    prediction: 'post-item--tip',
    tip: 'post-item--tip',
    bet: 'post-item--bet',
    simple: 'post-item--simple',
    opinion: 'post-item--simple',
  }[post.type] || '';

  return (
    <div 
      onClick={handlePostClick}
      className={`post-item ${postVariantClass}${!isDetailView ? ' cursor-pointer' : ''}`}
    >
      {createPostComponent(postProps)}
    </div>
  );
}, (prevProps, nextProps) => {
  // PERF FIX: More comprehensive comparison including reaction state
  if (prevProps.post.id !== nextProps.post.id) return false;
  if (prevProps.post.timestamp !== nextProps.post.timestamp) return false;
  if (prevProps.isDetailView !== nextProps.isDetailView) return false;
  if (prevProps.expandedComments !== nextProps.expandedComments) return false;
  if (prevProps.isLoadingComments !== nextProps.isLoadingComments) return false;
  
  // Compare reactions
  const prevReactions = prevProps.getPostReactions(prevProps.post);
  const nextReactions = nextProps.getPostReactions(nextProps.post);
  if (prevReactions.likes !== nextReactions.likes) return false;
  if (prevReactions.comments !== nextReactions.comments) return false;
  if (prevReactions.userLiked !== nextReactions.userLiked) return false;
  
  return true;
});