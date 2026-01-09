import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFilteredFeed } from '../../../hooks/useFilteredFeed';
import { useFeedData } from '../../../context/FeedDataContext';
import { createPostComponent } from '../../posts';
import { FeedSkeleton } from '../../shared/FeedSkeleton';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { Loader2 } from 'lucide-react';
import type { BasePostProps } from '../../posts/base/BasePostProps';

/**
 * BetsView - Displays only bet posts using local filtering
 * No additional API calls - filters from shared FeedDataContext
 */
export const BetsView = memo(function BetsView() {
  const { t } = useTranslation('feed');
  const { 
    feed, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    filteredCount 
  } = useFilteredFeed('bets');
  
  const {
    createReactionHandlers,
    getPostReactions,
    getPostComments,
    expandedComments,
    toggleComments,
    addPostComment,
    commentsLoading,
  } = useFeedData();

  const { targetRef } = useInfiniteScroll({
    hasMore: hasNextPage ?? false,
    isLoading: isLoading || isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  if (isLoading && filteredCount === 0) {
    return <FeedSkeleton message={t('loading.bets')} />;
  }

  if (!isLoading && filteredCount === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">
          {t('empty.noBets')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {feed.map((item) => {
        // Only stream posts (bets) will be in the filtered feed
        if (item.type !== 'stream') return null;
        
        const post = item.data;
        const postProps: BasePostProps = {
          post,
          reactions: getPostReactions(post),
          comments: getPostComments(post),
          showComments: expandedComments[post.id] || false,
          isLoadingComments: commentsLoading[post.activityId || ''] || false,
          onAddComment: async (text, gif) => { await addPostComment(post, text, gif); },
          onToggleComments: () => { toggleComments(post.id); },
          reactionHandlers: createReactionHandlers(post)
        };

        return (
          <div key={item.id}>
            {createPostComponent(postProps)}
          </div>
        );
      })}

      {hasNextPage && (
        <div ref={targetRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t('loading.more')}</span>
            </div>
          )}
        </div>
      )}

      {!hasNextPage && filteredCount > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {t('end.allBets')}
        </div>
      )}
    </div>
  );
});
