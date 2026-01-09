import React, { createContext, useContext, useMemo, useCallback, useState, memo } from 'react';
import { useHybridFeed } from '@/hooks/useHybridFeed';
import { useHybridFeedReactions } from '@/hooks/useHybridFeedReactions';
import type { HybridFeedItem } from '@/types/hybrid-feed';
import type { FeedPost, ReactionHandlers, ReactionCounts, Comment, Author } from '@/types/feed';
import type { PersonalizedHighlight } from '@/features/highlights/hooks/usePersonalizedHighlights';
import type { MatchData } from '@/features/sports/types';

interface FeedDataContextValue {
  // Feed data
  feed: HybridFeedItem[];
  streamPosts: FeedPost[];
  isLoading: boolean;
  
  // Pagination
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  
  // Social feed features
  expandedComments: Record<string, boolean>;
  commentsLoading: Record<string, boolean>;
  createReactionHandlers: (post: FeedPost) => ReactionHandlers;
  getPostReactions: (post: FeedPost) => ReactionCounts;
  getPostComments: (post: FeedPost) => Comment[];
  loadPostComments: (post: FeedPost, forceReload?: boolean) => Promise<void>;
  addPostComment: (post: FeedPost, text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => Promise<void>;
  toggleComments: (postId: string) => void;
  user: Author | null;
  
  // Hybrid reactions (for highlights/matches)
  hybridReactions: ReturnType<typeof useHybridFeedReactions>;
}

const FeedDataContext = createContext<FeedDataContextValue | null>(null);

interface FeedDataProviderProps {
  children: React.ReactNode;
  limit?: number;
}

export const FeedDataProvider = memo(function FeedDataProvider({ 
  children, 
  limit = 50 
}: FeedDataProviderProps) {
  const {
    feed,
    streamPosts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    user,
  } = useHybridFeed(limit);

  // Hybrid reactions for highlights and matches
  const hybridReactions = useHybridFeedReactions(feed);

  const value = useMemo<FeedDataContextValue>(() => ({
    feed,
    streamPosts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    user,
    hybridReactions,
  }), [
    feed,
    streamPosts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    user,
    hybridReactions,
  ]);

  return (
    <FeedDataContext.Provider value={value}>
      {children}
    </FeedDataContext.Provider>
  );
});

export function useFeedData(): FeedDataContextValue {
  const context = useContext(FeedDataContext);
  if (!context) {
    throw new Error('useFeedData must be used within a FeedDataProvider');
  }
  return context;
}

export { FeedDataContext };
