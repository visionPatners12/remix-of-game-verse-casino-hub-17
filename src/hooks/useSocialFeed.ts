/**
 * 📱 useSocialFeed - Hook pour le feed social principal
 * 
 * Utilise useBaseFeedOperations pour factoriser la logique commune
 */

import { useCallback } from 'react';
import { useTimelineFeed } from '@/hooks/useTimelineFeed';
import { useBaseFeedOperations } from '@/hooks/feed/useBaseFeedOperations';
import { useAuth } from '@/features/auth';
import { useGetStream } from '@/contexts/StreamProvider';
import { filterPostsById } from '@/services/social-feed/FeedDataService';
import type { FeedPost } from '@/types/feed';

/**
 * Consolidated hook for all social feed operations
 */
export function useSocialFeed(limit: number = 50) {
  const { user } = useAuth();
  const { isReady: isStreamReady } = useGetStream();
  
  // Fetch timeline data
  const { 
    activities, 
    isLoading: isLoadingTimeline,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTimelineFeed({
    userId: user?.id,
    limit,
    enabled: !!user?.id && isStreamReady
  });

  // Use base operations for all feed logic
  const {
    feedPosts,
    rawData,
    expandedComments,
    shareCount,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments
  } = useBaseFeedOperations(activities);

  // Filter posts by ID utility
  const filterFeedPostsById = useCallback((focusedPostId: string | null) => {
    return filterPostsById(feedPosts, focusedPostId);
  }, [feedPosts]);

  return {
    posts: feedPosts,
    rawData,
    isLoading: isLoadingTimeline,
    expandedComments,
    shareCount,
    commentsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    filterPostsById: filterFeedPostsById,
    user,
  };
}
