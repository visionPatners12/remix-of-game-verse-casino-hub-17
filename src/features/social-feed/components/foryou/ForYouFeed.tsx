// For You Feed Component - Hybrid Feed with Stream + Matches + Highlights
// Displays posts, matches, and highlights in an interleaved feed

import React, { memo, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetStream } from '@/contexts/StreamProvider';
import { useFeedData } from '@/features/social-feed/context/FeedDataContext';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { createPostComponent } from '../posts';
import { FocusMode } from './FocusMode';
import { HighlightFocusMode } from './HighlightFocusMode';
import { MatchFocusMode } from './MatchFocusMode';
import { FeedSkeleton } from '../shared/FeedSkeleton';
import { FeedErrorBoundary } from '../FeedErrorBoundary';
import { UnifiedMatchCard } from '@/components/matches';
import { HighlightPostComponent } from '@/features/posts/components/types/HighlightPostComponent';
import { transformHighlightToPost } from '@/features/highlights/utils/highlightToPost';
import type { PersonalizedHighlight } from '@/features/highlights/hooks/usePersonalizedHighlights';
import type { BasePostProps } from '../posts/base/BasePostProps';
import type { FeedPost } from '@/types/feed';
import type { HybridFeedItem } from '@/types/hybrid-feed';
import type { MatchData } from '@/features/sports/types';

// Memoized post wrapper to prevent unnecessary re-renders
const MemoizedPostItem = memo(function MemoizedPostItem({ 
  postProps
}: { 
  postProps: BasePostProps; 
}) {
  return createPostComponent(postProps);
});

const ForYouFeedContent = memo(function ForYouFeedContent() {
  const { t } = useTranslation('feed');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isReady: isStreamReady, isLoading: isStreamLoading } = useGetStream();
  
  const {
    feed,
    streamPosts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createReactionHandlers,
    getPostReactions,
    toggleComments,
    addPostComment,
    expandedComments,
    getPostComments,
    loadPostComments,
    commentsLoading,
    hybridReactions
  } = useFeedData();

  const { targetRef } = useInfiniteScroll({
    hasMore: hasNextPage ?? false,
    isLoading: isLoading || isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const [focusPost, setFocusPost] = useState<FeedPost | null>(null);
  const [focusHighlight, setFocusHighlight] = useState<PersonalizedHighlight | null>(null);
  const [focusMatch, setFocusMatch] = useState<(MatchData & { id?: string }) | null>(null);

  const handlePostClick = useCallback((post: FeedPost) => {
    loadPostComments(post, true);
    setFocusPost(post);
  }, [loadPostComments]);

  const handleHighlightClick = useCallback((highlight: PersonalizedHighlight) => {
    hybridReactions.toggleHighlightComments(highlight.id);
    setFocusHighlight(highlight);
  }, [hybridReactions]);

  const handleMatchClick = useCallback((match: MatchData & { id?: string }) => {
    if (match.id) {
      hybridReactions.toggleMatchComments(match.id);
      setFocusMatch(match);
    }
  }, [hybridReactions]);

  const handleCloseFocus = useCallback(() => {
    setFocusPost(null);
    setFocusHighlight(null);
    setFocusMatch(null);
  }, []);

  const handleAddComment = useCallback(async (
    comment: string, 
    gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    if (focusPost) {
      await addPostComment(focusPost, comment, gif);
    }
  }, [focusPost, addPostComment]);

  const handlersRef = useMemo(() => {
    const map = new Map<string, {
      onAddComment: (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => Promise<void>;
      onToggle: () => void;
    }>();
    
    for (const post of streamPosts) {
      map.set(post.id, {
        onAddComment: async (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => { await addPostComment(post, text, gif); },
        onToggle: () => { toggleComments(post.id); }
      });
    }
    
    return map;
  }, [streamPosts, addPostComment, toggleComments]);

  const streamPostPropsMap = useMemo(() => {
    const map = new Map<string, BasePostProps>();
    
    for (const post of streamPosts) {
      const handlers = handlersRef.get(post.id);
      map.set(post.id, {
        post,
        reactions: getPostReactions(post),
        comments: getPostComments(post),
        showComments: expandedComments[post.id] || false,
        isLoadingComments: false,
        onAddComment: handlers?.onAddComment || (async () => {}),
        onToggleComments: handlers?.onToggle || (() => {}),
        reactionHandlers: createReactionHandlers(post),
        onFocusPost: () => handlePostClick(post)
      });
    }
    
    return map;
  }, [streamPosts, getPostReactions, getPostComments, expandedComments, handlersRef, createReactionHandlers, handlePostClick]);

  const isInitialLoading = (!isStreamReady && isStreamLoading) || (isLoading && feed.length === 0);
  
  if (isInitialLoading) {
    return (
      <FeedSkeleton 
        message={!isStreamReady ? t('loading.initStream') : t('loading.feed')} 
      />
    );
  }

  if (!isLoading && feed.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-6 text-center">
          <p className="text-muted-foreground">
            {t('empty.noPosts')}
          </p>
        </div>
      </div>
    );
  }

  const renderFeedItem = (item: HybridFeedItem) => {
    switch (item.type) {
      case 'stream': {
        const props = streamPostPropsMap.get(item.data.id);
        if (!props) return null;
        return (
          <MemoizedPostItem
            key={item.id}
            postProps={props}
          />
        );
      }
      
      case 'match': {
        const matchData = item.data as MatchData & { id?: string };
        const matchId = matchData.id || '';
        return (
          <div key={item.id} onClick={() => handleMatchClick(matchData)} className="cursor-pointer">
            <UnifiedMatchCard
              match={matchData}
              variant="feed"
              reactions={hybridReactions.getMatchReactions(matchId)}
              comments={hybridReactions.getMatchComments(matchId)}
              showComments={hybridReactions.isMatchCommentsOpen(matchId)}
              isLoadingComments={hybridReactions.isMatchCommentsLoading(matchId)}
              onAddComment={(text, gif) => hybridReactions.addMatchComment(matchId, text, gif)}
              onToggleComments={() => hybridReactions.toggleMatchComments(matchId)}
              onLike={() => hybridReactions.createMatchReactionHandlers(matchId, () => hybridReactions.toggleMatchComments(matchId)).onLike?.()}
            />
          </div>
        );
      }
      
      case 'highlight': {
        const highlightData = item.data as PersonalizedHighlight;
        const highlightId = highlightData.id;
        const highlightPost = transformHighlightToPost(highlightData);
        
        return (
          <div key={item.id} onClick={() => handleHighlightClick(highlightData)} className="cursor-pointer">
            <HighlightPostComponent
              post={highlightPost}
              reactions={hybridReactions.getHighlightReactions(highlightId)}
              comments={hybridReactions.getHighlightComments(highlightId)}
              showComments={hybridReactions.isHighlightCommentsOpen(highlightId)}
              isLoadingComments={hybridReactions.isHighlightCommentsLoading(highlightId)}
              onAddComment={(text) => { hybridReactions.addHighlightComment(highlightId, text); }}
              onToggleComments={() => hybridReactions.toggleHighlightComments(highlightId)}
              reactionHandlers={hybridReactions.createHighlightReactionHandlers(highlightId)}
            />
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Focus modes superimposed on top */}
      {focusHighlight && (
        <HighlightFocusMode
          highlight={focusHighlight}
          comments={hybridReactions.getHighlightComments(focusHighlight.id)}
          isLoadingComments={hybridReactions.isHighlightCommentsLoading(focusHighlight.id)}
          onBack={handleCloseFocus}
          onAddComment={(text, gif) => hybridReactions.addHighlightComment(focusHighlight.id, text, gif)}
          reactions={hybridReactions.getHighlightReactions(focusHighlight.id)}
          reactionHandlers={hybridReactions.createHighlightReactionHandlers(focusHighlight.id)}
        />
      )}

      {focusMatch && (
        <MatchFocusMode
          match={focusMatch}
          comments={hybridReactions.getMatchComments(focusMatch.id || '')}
          isLoadingComments={hybridReactions.isMatchCommentsLoading(focusMatch.id || '')}
          onBack={handleCloseFocus}
          onAddComment={(text, gif) => hybridReactions.addMatchComment(focusMatch.id || '', text, gif)}
          reactions={hybridReactions.getMatchReactions(focusMatch.id || '')}
          onLike={() => hybridReactions.createMatchReactionHandlers(focusMatch.id || '', () => {}).onLike?.()}
        />
      )}

      {focusPost && (
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
      )}

      {/* Feed always rendered underneath */}
      <div className="max-w-2xl mx-auto space-y-4">
        {feed.map(renderFeedItem)}

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

        {!hasNextPage && feed.length > 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t('end.allPosts')}
          </div>
        )}
      </div>
    </>
  );
});

ForYouFeedContent.displayName = 'ForYouFeedContent';

const ForYouFeed = memo(function ForYouFeed() {
  const queryClient = useQueryClient();
  
  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['timeline-feed'] });
    queryClient.invalidateQueries({ queryKey: ['hybrid-feed'] });
  }, [queryClient]);

  return (
    <FeedErrorBoundary onRetry={handleRetry}>
      <ForYouFeedContent />
    </FeedErrorBoundary>
  );
});

ForYouFeed.displayName = 'ForYouFeed';

export { ForYouFeed };
