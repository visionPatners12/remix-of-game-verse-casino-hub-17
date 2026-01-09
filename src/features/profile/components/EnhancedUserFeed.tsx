import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUserFeed } from '@/hooks/useUserFeed';
import { useBaseFeedOperations } from '@/hooks/feed/useBaseFeedOperations';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { createPostComponent } from '@/features/social-feed/components/posts';
import { FocusMode } from '@/features/social-feed/components/foryou/FocusMode';
import type { BasePostProps } from '@/features/social-feed/components/posts/base/BasePostProps';
import type { FeedPost } from '@/types/feed';

interface EnhancedUserFeedProps {
  userId: string;
  activeFilter: string;
}

export function EnhancedUserFeed({ userId, activeFilter }: EnhancedUserFeedProps) {
  const { 
    activities, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useUserFeed({ userId, limit: 25 });
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  
  // Use shared feed operations hook (same as FeedController)
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
  
  // Enhanced expanded comments for focus mode
  const finalExpandedComments = useMemo(() => {
    if (focusedPostId) {
      return { ...expandedComments, [focusedPostId]: true };
    }
    return expandedComments;
  }, [expandedComments, focusedPostId]);

  // Load comments when focusing on a post
  useEffect(() => {
    if (focusedPostId) {
      enterFullscreen();
      const focusedPost = feedPosts.find(post => post.id === focusedPostId);
      if (focusedPost) {
        loadPostComments(focusedPost, true);
      }
    } else {
      exitFullscreen();
    }
  }, [focusedPostId, feedPosts, loadPostComments, enterFullscreen, exitFullscreen]);

  // Memoized handlers (same pattern as FeedController)
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
  
  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);
  
  // Filter posts by activeFilter
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'posts') return feedPosts;
    
    return feedPosts.filter(post => {
      if (activeFilter === 'bets') return post.type === 'bet';
      if (activeFilter === 'predictions') return post.type === 'prediction';
      return true;
    });
  }, [feedPosts, activeFilter]);

  // Find focused post
  const focusedPost = useMemo(() => {
    if (!focusedPostId) return null;
    return feedPosts.find(p => p.id === focusedPostId) || null;
  }, [focusedPostId, feedPosts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading content</p>
      </div>
    );
  }

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Focus Mode (same as FeedController) */}
      {focusedPost && (
        <FocusMode
          post={focusedPost}
          comments={getPostComments(focusedPost)}
          isLoadingComments={commentsLoading[focusedPost.activityId] || false}
          onBack={() => handleFocusPost(null)}
          onAddComment={(text, gif) => handleAddComment(focusedPost, text, gif)}
          reactions={getPostReactions(focusedPost)}
          reactionHandlers={createReactionHandlers(focusedPost)}
          onToggleComments={() => toggleComments(focusedPost.id)}
        />
      )}

      {/* Posts list */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {filteredPosts.map((post) => {
          const postProps: BasePostProps = {
            post,
            reactions: getPostReactions(post),
            comments: getPostComments(post),
            showComments: finalExpandedComments[post.id] || false,
            isLoadingComments: commentsLoading[post.activityId] || false,
            onAddComment: (text, gif) => handleAddComment(post, text, gif),
            onToggleComments: () => toggleComments(post.id),
            reactionHandlers: createReactionHandlers(post),
            onFocusPost: () => handleFocusPost(post.id),
          };

          return (
            <div key={post.id}>
              {createPostComponent(postProps)}
            </div>
          );
        })}
        
        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          {isFetchingNextPage && <LoadingSpinner />}
        </div>
      </div>
    </>
  );
}
