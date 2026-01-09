import { useMemo, useCallback } from 'react';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { useRpcUserFeed } from '@/hooks/useRpcUserFeed';
import type { HybridFeedItem, HybridFeedConfig } from '@/types/hybrid-feed';
import type { FeedPost, ReactionHandlers, ReactionCounts, Comment, Author } from '@/types/feed';

const DEFAULT_CONFIG: HybridFeedConfig = {
  streamPostsPerPersonalized: 3,
  prioritizeHighlights: true,
};

interface UseHybridFeedResult {
  // Feed data
  feed: HybridFeedItem[];
  streamPosts: FeedPost[];
  isLoading: boolean;
  
  // Pagination
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  
  // Social feed features (passed through)
  expandedComments: Record<string, boolean>;
  commentsLoading: Record<string, boolean>;
  createReactionHandlers: (post: FeedPost) => ReactionHandlers;
  getPostReactions: (post: FeedPost) => ReactionCounts;
  getPostComments: (post: FeedPost) => Comment[];
  loadPostComments: (post: FeedPost, forceReload?: boolean) => Promise<void>;
  addPostComment: (post: FeedPost, text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => Promise<void>;
  toggleComments: (postId: string) => void;
  user: Author | null;
}

/**
 * Orchestrator hook that combines stream posts with personalized content from rpc_user_feed
 * Interleaves content: every N stream posts, insert a personalized item (match or highlight)
 */
export function useHybridFeed(
  limit: number = 50,
  config: Partial<HybridFeedConfig> = {}
): UseHybridFeedResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Fetch social stream posts
  const {
    posts: streamPosts,
    isLoading: isLoadingStream,
    fetchNextPage: fetchStreamNext,
    hasNextPage: hasStreamNext,
    isFetchingNextPage: isFetchingStream,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    user,
  } = useSocialFeed(limit);

  // Fetch personalized content from RPC (matches + highlights combined)
  // INCREASED: Use a larger limit for RPC to ensure sufficient content
  const rpcLimit = Math.max(50, Math.ceil(limit / finalConfig.streamPostsPerPersonalized) + 20);
  const {
    feed: rpcFeed,
    isLoading: isLoadingRpc,
    fetchNextPage: fetchRpcNext,
    hasNextPage: hasRpcNext,
    isFetchingNextPage: isFetchingRpc,
  } = useRpcUserFeed({ limit: rpcLimit, enabled: true });


  // Separate live matches from RPC feed to display them at the top
  const { liveMatches, nonLiveRpcFeed } = useMemo(() => {
    const live: HybridFeedItem[] = [];
    const nonLive: HybridFeedItem[] = [];
    
    rpcFeed.forEach(item => {
      // Check if it's a live match (status === 'inplay' in PersonalizedMatch)
      if (item.type === 'match' && item.data?.status === 'inplay') {
        live.push(item);
      } else {
        nonLive.push(item);
      }
    });
    
    return { liveMatches: live, nonLiveRpcFeed: nonLive };
  }, [rpcFeed]);

  // Interleave stream posts with RPC feed items (matches + highlights)
  // Live matches are placed at the top
  const feed = useMemo(() => {
    const result: HybridFeedItem[] = [];
    
    // 1. Add live matches at the top first
    result.push(...liveMatches);
    
    let rpcIndex = 0;

    // If no stream posts, show live matches + personalized content only from RPC
    if (streamPosts.length === 0) {
      result.push(...nonLiveRpcFeed);
      return result;
    }

    // If no non-live RPC, show live matches + stream posts only
    if (nonLiveRpcFeed.length === 0) {
      streamPosts.forEach(post => {
        result.push({ type: 'stream' as const, data: post, id: `stream-${post.id}` });
      });
      return result;
    }

    // Normal interleaving when we have both feeds
    streamPosts.forEach((post, i) => {
      // Add stream post
      result.push({ type: 'stream', data: post, id: `stream-${post.id}` });

      // Every N posts, insert personalized content from RPC (non-live)
      if ((i + 1) % finalConfig.streamPostsPerPersonalized === 0 && rpcIndex < nonLiveRpcFeed.length) {
        result.push(nonLiveRpcFeed[rpcIndex]);
        rpcIndex++;
      }
    });

    // Append remaining non-live RPC items at the end
    while (rpcIndex < nonLiveRpcFeed.length) {
      result.push(nonLiveRpcFeed[rpcIndex]);
      rpcIndex++;
    }

    return result;
  }, [streamPosts, liveMatches, nonLiveRpcFeed, finalConfig.streamPostsPerPersonalized]);

  // Orchestrated fetch next page - load BOTH sources in parallel, independently
  const fetchNextPage = useCallback(() => {
    // Load more stream posts if available and not already fetching
    if (hasStreamNext && !isFetchingStream) {
      fetchStreamNext();
    }
    
    // Load more RPC content if available and not already fetching
    if (hasRpcNext && !isFetchingRpc) {
      fetchRpcNext();
    }
  }, [
    fetchStreamNext, fetchRpcNext,
    hasStreamNext, hasRpcNext,
    isFetchingStream, isFetchingRpc,
    streamPosts.length, rpcFeed.length
  ]);

  return {
    feed,
    streamPosts,
    isLoading: isLoadingStream || isLoadingRpc,
    fetchNextPage,
    hasNextPage: hasStreamNext || hasRpcNext,
    isFetchingNextPage: isFetchingStream || isFetchingRpc,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    user,
  };
}
