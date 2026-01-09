import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFeedData } from '@/features/social-feed/context/FeedDataContext';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { FeedPresenter } from '../presenters/FeedPresenter';
import type { FeedPost } from '@/types/feed';

interface FeedControllerProps {
  filterType?: 'all' | 'bets' | 'predictions';
}

/**
 * Controller component that handles all business logic for the hybrid social feed
 * OPTIMIZED: Consumes FeedDataContext instead of calling hooks directly (no duplicate fetches)
 * All handlers are memoized to prevent unnecessary re-renders downstream
 */
export function FeedController({ filterType = 'all' }: FeedControllerProps) {
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  
  // OPTIMIZED: Single source of truth from FeedDataContext
  const {
    feed,
    streamPosts,
    isLoading,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    user,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    hybridReactions,
  } = useFeedData();

  // Filter feed by type - strict filtering (no mixing content types)
  const filteredFeed = useMemo(() => {
    if (filterType === 'all') return feed;
    
    return feed.filter(item => {
      // For bets filter: only show bet posts (no highlights, no matches, no predictions)
      if (filterType === 'bets') {
        return item.type === 'stream' && item.data.type === 'bet';
      }
      
      // For predictions filter: only show prediction posts (no highlights, no matches, no bets)
      if (filterType === 'predictions') {
        return item.type === 'stream' && item.data.type === 'prediction';
      }
      
      return true;
    });
  }, [feed, filterType]);

  // Then apply focus filtering
  const displayedFeed = useMemo(() => {
    if (focusedPostId) {
      return filteredFeed.filter(item => 
        item.type === 'stream' && item.data.id === focusedPostId
      );
    }
    return filteredFeed;
  }, [filteredFeed, focusedPostId]);

  // Enhanced expanded comments for focus mode
  const finalExpandedComments = useMemo(() => {
    if (focusedPostId) {
      return { ...expandedComments, [focusedPostId]: true };
    }
    return expandedComments;
  }, [expandedComments, focusedPostId]);

  // Load comments when focusing on a post and toggle fullscreen (hide bottom navbar)
  useEffect(() => {
    if (focusedPostId) {
      enterFullscreen();
      const focusedPost = streamPosts.find(post => post.id === focusedPostId);
      if (focusedPost) {
        loadPostComments(focusedPost, true);
      }
    } else {
      exitFullscreen();
    }
  }, [focusedPostId, streamPosts, loadPostComments, enterFullscreen, exitFullscreen]);

  // PERF FIX: Memoize all handlers to prevent re-renders
  const handleFocusPost = useCallback((postId: string | null) => {
    setFocusedPostId(postId);
  }, []);

  const handleAddComment = useCallback(async (
    post: FeedPost, 
    text: string,
    gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    await addPostComment(post, text, gif);
  }, [addPostComment]);

  const handleToggleComments = useCallback((postId: string) => {
    toggleComments(postId);
  }, [toggleComments]);

  return (
    <FeedPresenter
      feed={displayedFeed}
      posts={streamPosts}
      focusedPostId={focusedPostId}
      expandedComments={finalExpandedComments}
      commentsLoading={commentsLoading}
      onFocusPost={handleFocusPost}
      onAddComment={handleAddComment}
      onToggleComments={handleToggleComments}
      createReactionHandlers={createReactionHandlers}
      getPostReactions={getPostReactions}
      getPostComments={getPostComments}
      user={user!}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      hybridReactions={hybridReactions}
    />
  );
}
