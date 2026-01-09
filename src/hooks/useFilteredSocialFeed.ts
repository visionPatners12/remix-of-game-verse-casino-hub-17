/**
 * 🔍 useFilteredSocialFeed - Hook pour le feed social filtré par tags
 * 
 * Utilise le filtrage serveur GetStream avec filter_tags:
 * - match:<azuro_game_id> - Activités liées à un match
 * - league:<uuid> - Activités liées à une ligue
 * - home_team:<uuid> ou away_team:<uuid> - Activités liées à une équipe
 * 
 * Utilise useBaseFeedOperations pour factoriser la logique commune
 */

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useGetStream } from '@/contexts/StreamProvider';
import { useAuth } from '@/features/auth';
import { useBaseFeedOperations } from '@/hooks/feed/useBaseFeedOperations';
import { StreamService } from '@/services/getstream/streamService';
import { logger } from '@/utils/logger';
import { cacheConfigs } from '@/lib/queryClient';
import type { StreamActivity } from '@/types/stream';
import { filterValidActivities } from '@/types/stream';
import type { FeedPost, ReactionHandlers, Comment } from '@/types/feed';

interface UseFilteredSocialFeedOptions {
  /** Tag(s) pour filtrer les activités (ex: "match:abc123" ou ["home_team:x", "away_team:x"]) */
  filterTags: string | string[];
  /** Limite d'activités par page */
  limit?: number;
  /** Désactiver le hook */
  enabled?: boolean;
}

interface UseFilteredSocialFeedResult {
  posts: FeedPost[];
  isLoading: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  // Reaction handlers
  createReactionHandlers: (post: FeedPost) => ReactionHandlers;
  getPostReactions: (post: FeedPost) => { likes: number; comments: number; shares: number; userLiked: boolean };
  getPostComments: (post: FeedPost) => Comment[];
  loadPostComments: (post: FeedPost, forceReload?: boolean) => Promise<void>;
  addPostComment: (post: FeedPost, text: string, gif?: any) => Promise<void>;
  toggleComments: (postId: string) => void;
  expandedComments: Record<string, boolean>;
  commentsLoading: Record<string, boolean>;
}

export function useFilteredSocialFeed({
  filterTags,
  limit = 25,
  enabled = true
}: UseFilteredSocialFeedOptions): UseFilteredSocialFeedResult {
  const { user } = useAuth();
  const { client, isReady } = useGetStream();
  
  // Normaliser filterTags en array
  const tagsArray = useMemo(() => 
    Array.isArray(filterTags) ? filterTags : [filterTags],
    [filterTags]
  );

  // Fetcher avec filtrage serveur GetStream
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['filtered-timeline-feed', user?.id, tagsArray],
    queryFn: async ({ pageParam }) => {
      // Throw instead of returning empty data to prevent caching empty results
      if (!client || !user?.id || !tagsArray.length || !tagsArray[0]) {
        throw new Error('Stream client or user not ready');
      }

      logger.debug('[FILTERED_FEED] Fetching with server filter', { 
        userId: user.id, 
        filterTags: tagsArray,
        limit,
        offset: pageParam || 'none'
      });

      const result = await StreamService.getFilteredTimelineFeed(
        client, 
        user.id, 
        tagsArray, 
        limit, 
        pageParam
      );

      return result;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.activities.length === 0) {
        return undefined;
      }
      return lastPage.activities[lastPage.activities.length - 1].id;
    },
    // Stricter enabled condition to prevent race conditions
    enabled: enabled && isReady === true && client !== null && !!user?.id && tagsArray.length > 0 && !!tagsArray[0],
    staleTime: cacheConfigs.timeline.staleTime,
    gcTime: cacheConfigs.timeline.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false, // Don't retry if client not ready - wait for enabled to change
  });

  // Flatten and validate activities
  const activities = useMemo(() => {
    const rawActivities = data?.pages.flatMap(page => page.activities) || [];
    // filterValidActivities handles the type narrowing internally
    return filterValidActivities(rawActivities, (msg, logData) => {
      logger.warn(msg, logData);
    });
  }, [data]);

  // Use base operations for all feed logic
  const {
    feedPosts,
    expandedComments,
    commentsLoading,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments
  } = useBaseFeedOperations(activities);

  return {
    posts: feedPosts,
    isLoading,
    error: error as Error | null,
    fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    expandedComments,
    commentsLoading
  };
}
