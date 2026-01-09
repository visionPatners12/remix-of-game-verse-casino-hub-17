/**
 * 🔍 SocialFeedFiltered - Affiche le feed social filtré par tags (server-side)
 * 
 * Utilisé dans les pages match-details, league et team pour afficher
 * uniquement les prédictions/bets liés à l'entité via GetStream filter API.
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MessageSquare } from 'lucide-react';
import { useFilteredSocialFeed } from '@/hooks/useFilteredSocialFeed';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { createPostComponent } from './posts';
import { FocusMode } from './foryou/FocusMode';
import { FeedSkeleton } from './shared/FeedSkeleton';
import type { BasePostProps } from './posts/base/BasePostProps';
import type { FeedPost } from '@/types/feed';

interface SocialFeedFilteredProps {
  /** Tag(s) pour filtrer (ex: "match:abc123" ou ["home_team:x", "away_team:x"]) */
  filterTags: string | string[];
  /** Message à afficher quand le feed est vide */
  emptyMessage?: string;
}

// Memoized post wrapper
const MemoizedPostItem = memo(function MemoizedPostItem({ 
  postProps, 
  onClick 
}: { 
  postProps: BasePostProps; 
  onClick: () => void;
}) {
  return (
    <div onClick={onClick}>
      {createPostComponent(postProps)}
    </div>
  );
});

export const SocialFeedFiltered = memo(function SocialFeedFiltered({
  filterTags,
  emptyMessage
}: SocialFeedFilteredProps) {
  const { t } = useTranslation('feed');
  const [focusPost, setFocusPost] = useState<FeedPost | null>(null);

  // Get filtered posts using server-side GetStream filtering
  const {
    posts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    loadPostComments,
    addPostComment,
    toggleComments,
    expandedComments,
    commentsLoading
  } = useFilteredSocialFeed({ filterTags, enabled: !!filterTags });

  const { targetRef } = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoading: isLoading || isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const handlePostClick = useCallback((post: FeedPost) => {
    loadPostComments(post, true);
    setFocusPost(post);
  }, [loadPostComments]);

  const handleCloseFocus = useCallback(() => {
    setFocusPost(null);
  }, []);

  const handleAddComment = useCallback(async (
    comment: string, 
    gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    if (focusPost) {
      await addPostComment(focusPost, comment, gif);
    }
  }, [focusPost, addPostComment]);

  // Build post props map
  const postPropsMap = useMemo(() => {
    const map = new Map<string, BasePostProps>();
    
    for (const post of posts) {
      map.set(post.id, {
        post,
        reactions: getPostReactions(post),
        comments: getPostComments(post),
        showComments: expandedComments[post.id] || false,
        isLoadingComments: false,
        onAddComment: async (text: string, gif?: any) => { await addPostComment(post, text, gif); },
        onToggleComments: () => { toggleComments(post.id); },
        reactionHandlers: createReactionHandlers(post)
      });
    }
    
    return map;
  }, [posts, getPostReactions, getPostComments, expandedComments, addPostComment, toggleComments, createReactionHandlers]);

  if (isLoading && posts.length === 0) {
    return <FeedSkeleton message={t('loading.socialFeed')} />;
  }

  // Focus mode
  if (focusPost) {
    return (
      <FocusMode
        post={focusPost}
        comments={getPostComments(focusPost)}
        isLoadingComments={commentsLoading[focusPost.activityId || ''] || false}
        onBack={handleCloseFocus}
        onAddComment={handleAddComment}
        reactions={getPostReactions(focusPost)}
        reactionHandlers={createReactionHandlers(focusPost)}
        onToggleComments={() => toggleComments(focusPost.id)}
      />
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-sm">{emptyMessage || t('empty.noMatchPredictions')}</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          {t('empty.predictionsWillAppear')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => {
        const props = postPropsMap.get(post.id);
        if (!props) return null;
        return (
          <MemoizedPostItem
            key={post.id}
            postProps={props}
            onClick={() => handlePostClick(post)}
          />
        );
      })}

      {hasNextPage && (
        <div ref={targetRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t('loading.generic')}</span>
            </div>
          )}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {t('end.allLoaded')}
        </div>
      )}
    </div>
  );
});
