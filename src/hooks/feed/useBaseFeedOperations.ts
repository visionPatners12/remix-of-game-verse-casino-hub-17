/**
 * 🔧 useBaseFeedOperations - Hook de base partagé pour les opérations du feed
 * 
 * Factorise la logique commune entre useSocialFeed et useFilteredSocialFeed:
 * - Gestion des réactions (likes, comments, shares)
 * - Transformation des activités en posts
 * - Gestion des commentaires expandables
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useStreamReactions } from '@/hooks/useStreamReactions';
import { useStreamComments } from '@/features/live/hooks';
import { useAuth } from '@/features/auth';
import { 
  transformPredictions, 
  transformPosts, 
  transformOpinions, 
  transformBets,
  transformPolymarketPredictions,
  combineAndSortPosts 
} from '@/services/social-feed/FeedDataService';
import { formatFullName } from '@/utils/feedHelpers';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import type { FeedPost, ReactionHandlers, Comment, Author } from '@/types/feed';
import type { StreamActivity } from '@/types/stream';

// Rate limiting: minimum 500ms between like actions
const LIKE_THROTTLE_MS = 500;

interface GroupedActivities {
  predictions: StreamActivity[];
  bets: StreamActivity[];
  posts: StreamActivity[];
  opinions: StreamActivity[];
  polymarketPredictions: StreamActivity[];
}

interface UseBaseFeedOperationsResult {
  // Posts transformés
  feedPosts: FeedPost[];
  rawData: GroupedActivities;
  
  // État UI
  expandedComments: Record<string, boolean>;
  shareCount: Record<string, number>;
  commentsLoading: Record<string, boolean>;
  
  // Handlers
  createReactionHandlers: (post: FeedPost) => ReactionHandlers;
  getPostReactions: (post: FeedPost) => { likes: number; comments: number; shares: number; userLiked: boolean };
  getPostComments: (post: FeedPost) => Comment[];
  loadPostComments: (post: FeedPost, forceReload?: boolean) => Promise<void>;
  addPostComment: (post: FeedPost, text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => Promise<void>;
  toggleComments: (postId: string) => void;
  
  // Utility
  userToAuthor: () => Author | null;
}

/**
 * Hook de base pour les opérations du feed
 * Factorise ~200 lignes de code dupliqué entre useSocialFeed et useFilteredSocialFeed
 */
export function useBaseFeedOperations(activities: StreamActivity[]): UseBaseFeedOperationsResult {
  const { user } = useAuth();
  
  const { handleLike, handleUnlike, handleComment, getReactionCounts, initializeReactions } = useStreamReactions();
  const { getCommentsForActivity, loadComments, addCommentToActivity, isLoading: commentsLoading } = useStreamComments();
  
  // État UI
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [shareCount, setShareCount] = useState<Record<string, number>>({});
  
  // Refs for tracking (don't trigger re-renders)
  const initializedItemsRef = useRef<Set<string>>(new Set());
  const loadedCommentsRef = useRef<Set<string>>(new Set());
  const lastLikeTimeRef = useRef<Map<string, number>>(new Map());

  // OPTIMIZED: Single pass to group and transform activities
  const { feedPosts, rawData } = useMemo(() => {
    const grouped: GroupedActivities = {
      predictions: [],
      bets: [],
      posts: [],
      opinions: [],
      polymarketPredictions: []
    };
    
    // Single loop to group by verb
    for (const activity of activities) {
      switch (activity.verb) {
        case 'predict': grouped.predictions.push(activity); break;
        case 'bet': grouped.bets.push(activity); break;
        case 'simple_post': grouped.posts.push(activity); break;
        case 'opinion': grouped.opinions.push(activity); break;
        case 'polymarket_predict': grouped.polymarketPredictions.push(activity); break;
      }
    }
    
    // Transform and combine
    const allPosts = combineAndSortPosts([
      transformPredictions(grouped.predictions, getReactionCounts),
      transformPosts(grouped.posts, getReactionCounts),
      transformOpinions(grouped.opinions, getReactionCounts),
      transformBets(grouped.bets, getReactionCounts),
      transformPolymarketPredictions(grouped.polymarketPredictions, getReactionCounts)
    ]);
    
    return { feedPosts: allPosts, rawData: grouped };
  }, [activities, getReactionCounts]);

  // Cleanup refs to avoid memory leaks
  const cleanupRefs = useCallback(() => {
    if (initializedItemsRef.current.size > 500) {
      initializedItemsRef.current.clear();
    }
    if (loadedCommentsRef.current.size > 200) {
      loadedCommentsRef.current.clear();
    }
  }, []);

  // Initialize reactions when data changes
  useEffect(() => {
    cleanupRefs();
    
    const allActivities = [
      ...rawData.predictions, 
      ...rawData.posts, 
      ...rawData.opinions, 
      ...rawData.bets,
      ...rawData.polymarketPredictions
    ];
    
    for (const item of allActivities) {
      if (item?.id && !initializedItemsRef.current.has(item.id)) {
        initializeReactions(item.id, {
          reaction_counts: item.reaction_counts || {},
          own_reactions: item.own_reactions || {},
          latest_reactions: item.latest_reactions || {}
        });
        initializedItemsRef.current.add(item.id);
      }
    }
  }, [rawData, initializeReactions, cleanupRefs]);

  // Helper to convert AuthUser to Author
  const userToAuthor = useCallback((): Author | null => {
    if (!user) return null;
    
    const username = user.user_metadata?.username || `user_${user.id.slice(0, 8)}`;
    const fullName = formatFullName(
      user.user_metadata?.first_name,
      user.user_metadata?.last_name,
      username
    );
    
    return {
      id: user.id,
      username,
      fullName,
      avatar: user.user_metadata?.avatar_url
    };
  }, [user]);

  // Handle share with proper state update
  const handleShare = useCallback((postId: string) => {
    setShareCount(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
  }, []);

  // Ref pattern for stable reference
  const feedPostsRef = useRef(feedPosts);
  feedPostsRef.current = feedPosts;

  const toggleCommentsWithLoad = useCallback((postId: string) => {
    setExpandedComments(prev => {
      const wasExpanded = prev[postId];
      
      if (!wasExpanded) {
        const post = feedPostsRef.current.find(p => p.id === postId);
        if (post?.activityId) {
          loadComments(post.activityId);
        }
      }
      
      return { ...prev, [postId]: !wasExpanded };
    });
  }, [loadComments]);

  // PERF: Stable reference with rate limiting for likes
  const createReactionHandlers = useCallback((post: FeedPost): ReactionHandlers => ({
    onLike: async () => {
      const activityId = post.activityId;
      const author = userToAuthor();
      if (!activityId || !author) return;
      
      // Rate limiting check
      const now = Date.now();
      const lastLikeTime = lastLikeTimeRef.current.get(activityId) || 0;
      if (now - lastLikeTime < LIKE_THROTTLE_MS) {
        logger.debug('Like throttled for activity:', activityId);
        return;
      }
      lastLikeTimeRef.current.set(activityId, now);
      
      try {
        const currentReactions = getReactionCounts(activityId);
        if (currentReactions.userLiked) {
          await handleUnlike(activityId, author.id);
        } else {
          await handleLike(activityId, author);
        }
      } catch (error) {
        logger.error('Failed to update like', error);
        toast.error('Unable to update like. Please try again.');
        // Reset throttle on error to allow retry
        lastLikeTimeRef.current.delete(activityId);
      }
    },
    onComment: () => toggleCommentsWithLoad(post.id),
    onShare: () => handleShare(post.id)
  }), [userToAuthor, getReactionCounts, handleUnlike, handleLike, toggleCommentsWithLoad, handleShare]);

  // UNIFIED: Single source of truth for reactions
  const getPostReactions = useCallback((post: FeedPost) => {
    const activityId = post.activityId;
    if (!activityId) {
      return { likes: 0, comments: 0, shares: shareCount[post.id] || 0, userLiked: false };
    }
    
    const streamReactions = getReactionCounts(activityId);
    return {
      likes: streamReactions.likes || 0,
      comments: streamReactions.comments || 0,
      userLiked: streamReactions.userLiked || false,
      shares: shareCount[post.id] || streamReactions.shares || 0
    };
  }, [getReactionCounts, shareCount]);

  const getPostComments = useCallback((post: FeedPost): Comment[] => {
    if (!post.activityId) return [];
    return getCommentsForActivity(post.activityId);
  }, [getCommentsForActivity]);

  const loadPostComments = useCallback(async (post: FeedPost, forceReload: boolean = false) => {
    const activityId = post.activityId;
    if (!activityId) return;
    
    if (!loadedCommentsRef.current.has(activityId) || forceReload) {
      loadedCommentsRef.current.add(activityId);
      await loadComments(activityId, forceReload);
    }
  }, [loadComments]);

  const addPostComment = useCallback(async (
    post: FeedPost, 
    text: string,
    gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    const author = userToAuthor();
    if (!author) {
      logger.warn('User not authenticated for comment');
      toast.error('Please sign in to comment.');
      return;
    }
    
    const activityId = post.activityId;
    if (!activityId) {
      logger.warn('No activityId for comment');
      toast.error('Unable to add comment. Please try again.');
      return;
    }
    
    try {
      const response = await handleComment(activityId, text, author, gif);
      
      // Add comment optimistically to UI
      if (response) {
        const newComment: Comment = {
          id: response.id,
          username: author.username,
          fullName: author.fullName,
          displayUsername: `@${author.username}`,
          avatar: author.avatar,
          text: text,
          timestamp: 'now',
          gif: gif
        };
        addCommentToActivity(activityId, newComment);
      }
    } catch (error) {
      logger.error('Failed to add comment', error);
      toast.error('Unable to post comment. Please try again.');
      throw error;
    }
  }, [userToAuthor, handleComment, addCommentToActivity]);

  return {
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
    toggleComments: toggleCommentsWithLoad,
    userToAuthor
  };
}
