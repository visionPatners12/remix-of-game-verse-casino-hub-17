import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumTipsFeed } from '@/hooks/usePremiumTipsFeed';
import { useStreamReactions } from '@/hooks/useStreamReactions';
import { useStreamComments } from '@/features/live/hooks';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { 
  transformPredictions, 
  transformPosts, 
  transformOpinions, 
  transformBets, 
  combineAndSortPosts 
} from '@/services/social-feed/FeedDataService';
import { FeedPresenter } from '@/features/social-feed/components/feed/presenters/FeedPresenter';
import { Target } from 'lucide-react';
import { logger } from '@/utils/logger';
import type { FeedPost, ReactionHandlers } from '@/types/feed';
import type { StreamActivity } from '@/types/stream';

export function PremiumTipsFeedController() {
  const { t } = useTranslation('tipster');
  const { user } = useAuth();
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [shareCount, setShareCount] = useState<Record<string, number>>({});
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  
  // Fetch premium tips feed
  const { activities, isLoading: isLoadingFeed } = usePremiumTipsFeed({ 
    userId: user?.id, 
    limit: 50 
  });
  
  // Initialize hooks
  const { handleLike, handleUnlike, handleComment, getReactionCounts } = useStreamReactions();
  const { getCommentsForActivity, loadComments, isLoading: commentsLoadingState } = useStreamComments();
  
  const loadedCommentsRef = useRef<Set<string>>(new Set());

  // Transform activities to posts (inline, replacing useTransformedFeed)
  const posts = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    
    const grouped = {
      predictions: [] as StreamActivity[],
      bets: [] as StreamActivity[],
      posts: [] as StreamActivity[],
      opinions: [] as StreamActivity[]
    };
    
    for (const activity of activities as StreamActivity[]) {
      switch (activity.verb) {
        case 'predict': grouped.predictions.push(activity); break;
        case 'bet': grouped.bets.push(activity); break;
        case 'simple_post': grouped.posts.push(activity); break;
        case 'opinion': grouped.opinions.push(activity); break;
      }
    }
    
    return combineAndSortPosts([
      transformPredictions(grouped.predictions, getReactionCounts),
      transformPosts(grouped.posts, getReactionCounts),
      transformOpinions(grouped.opinions, getReactionCounts),
      transformBets(grouped.bets, getReactionCounts)
    ]);
  }, [activities, getReactionCounts]);

  // Convert commentsLoadingState to match FeedPresenter expectations
  const commentsLoading = useMemo(() => commentsLoadingState, [commentsLoadingState]);

  // Toggle comments visibility
  const toggleComments = useCallback((postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  // Handle share
  const handleShare = useCallback((postId: string) => {
    setShareCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  }, []);

  // Create reaction handlers for a post
  const createReactionHandlers = useCallback((post: FeedPost): ReactionHandlers => ({
    onLike: () => {
      const activityId = post.activityId;
      if (activityId && user) {
        const currentReactions = getReactionCounts(activityId);
        if (currentReactions.userLiked) {
          handleUnlike(activityId, user.id);
        } else {
          handleLike(activityId, user);
        }
      }
    },
    onComment: () => toggleComments(post.id),
    onShare: () => handleShare(post.id)
  }), [user, getReactionCounts, handleUnlike, handleLike, toggleComments, handleShare]);

  // Get reactions for a post
  const getPostReactions = useCallback((post: FeedPost) => {
    const baseReactions = post.activityId ? getReactionCounts(post.activityId) : post.reactions;
    return {
      ...baseReactions,
      shares: shareCount[post.id] || baseReactions?.shares || 0
    };
  }, [getReactionCounts, shareCount]);

  // Get comments for a post
  const getPostComments = useCallback((post: FeedPost) => {
    if (!post.activityId) return [];
    return getCommentsForActivity(post.activityId);
  }, [getCommentsForActivity]);

  // Load comments for a post
  const loadPostComments = useCallback(async (post: FeedPost, forceReload: boolean = false) => {
    const activityId = post.activityId;
    if (!activityId) return;
    
    if (!loadedCommentsRef.current.has(activityId) || forceReload) {
      loadedCommentsRef.current.add(activityId);
      await loadComments(activityId, forceReload);
    }
  }, [loadComments]);

  // Add comment to a post
  const handleAddComment = useCallback(async (
    post: FeedPost, 
    text: string,
    gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    if (!user) {
      logger.warn('User not authenticated');
      return;
    }
    
    const activityId = post.activityId;
    if (activityId) {
      try {
        await handleComment(activityId, text, user, gif);
        await loadComments(activityId, true);
      } catch (error) {
        logger.error('Failed to add comment', error);
        throw error;
      }
    }
  }, [user, handleComment, loadComments]);

  // Handle toggling comments
  const handleToggleComments = useCallback(async (postId: string) => {
    const wasExpanded = expandedComments[postId];
    toggleComments(postId);
    
    // Auto-load comments when expanding
    if (!wasExpanded) {
      const post = posts.find(p => p.id === postId);
      if (post) await loadPostComments(post);
    }
  }, [toggleComments, posts, expandedComments, loadPostComments]);

  // Filter posts for focus mode
  const displayedPosts = useMemo(() => {
    if (focusedPostId) {
      return posts.filter(p => p.id === focusedPostId);
    }
    return posts;
  }, [posts, focusedPostId]);

  // Enhanced expanded comments for focus mode
  const finalExpandedComments = useMemo(() => {
    if (focusedPostId) {
      return { ...expandedComments, [focusedPostId]: true };
    }
    return expandedComments;
  }, [expandedComments, focusedPostId]);

  // Toggle fullscreen (hide bottom navbar) in focus mode
  useEffect(() => {
    if (focusedPostId) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [focusedPostId, enterFullscreen, exitFullscreen]);

  if (isLoadingFeed) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('dashboard.feed.noPremiumTips')}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {t('dashboard.feed.noPremiumTipsDesc')}
        </p>
      </div>
    );
  }

  return (
    <FeedPresenter
      posts={displayedPosts}
      focusedPostId={focusedPostId}
      expandedComments={finalExpandedComments}
      commentsLoading={commentsLoading}
      onFocusPost={setFocusedPostId}
      onAddComment={handleAddComment}
      onToggleComments={handleToggleComments}
      createReactionHandlers={createReactionHandlers}
      getPostReactions={getPostReactions}
      getPostComments={getPostComments}
      user={user}
      fetchNextPage={() => {}}
      hasNextPage={false}
      isFetchingNextPage={false}
    />
  );
}