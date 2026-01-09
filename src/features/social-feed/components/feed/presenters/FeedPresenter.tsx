import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PostItem } from '../PostItem';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { HighlightPostComponent } from '@/features/posts/components/types/HighlightPostComponent';
import { UnifiedMatchCard } from '@/components/matches';
import { transformRpcHighlightToPost } from '@/features/highlights/utils/highlightToPost';
import type { RpcHighlightData } from '@/features/feed/types/rpcUserFeed';
import type { FeedPost, ReactionHandlers, ReactionCounts, Comment, Author } from '@/types/feed';
import type { HybridFeedItem } from '@/types/hybrid-feed';
import type { useHybridFeedReactions } from '@/hooks/useHybridFeedReactions';

interface FeedPresenterProps {
  feed?: HybridFeedItem[];
  posts: FeedPost[];
  focusedPostId: string | null;
  expandedComments: Record<string, boolean>;
  commentsLoading: Record<string, boolean>;
  onFocusPost: (postId: string | null) => void;
  onAddComment: (post: FeedPost, text: string) => Promise<void>;
  onToggleComments: (postId: string) => void;
  createReactionHandlers: (post: FeedPost) => ReactionHandlers;
  getPostReactions: (post: FeedPost) => ReactionCounts;
  getPostComments: (post: FeedPost) => Comment[];
  user: Author | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading?: boolean;
  hybridReactions?: ReturnType<typeof useHybridFeedReactions>;
}

/**
 * Presentation component - renders hybrid feed with stream posts, highlights, and matches
 * Falls back to posts-only mode if feed is not provided (backward compatibility)
 */
export function FeedPresenter({
  feed,
  posts,
  focusedPostId,
  expandedComments,
  commentsLoading,
  onFocusPost,
  onAddComment,
  onToggleComments,
  createReactionHandlers,
  getPostReactions,
  getPostComments,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading = false,
  hybridReactions,
}: FeedPresenterProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const { targetRef } = useInfiniteScroll({
    hasMore: hasNextPage && !focusedPostId,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

  const stopTouchPropagation = React.useCallback((e: React.TouchEvent) => {
    if (isMobile && focusedPostId) {
      e.stopPropagation();
    }
  }, [isMobile, focusedPostId]);

  // When focused, show only the focused post
  const displayedFeed = React.useMemo(() => {
    // If no hybrid feed provided, create one from posts (backward compatibility)
    const effectiveFeed: HybridFeedItem[] = feed || posts.map(post => ({
      type: 'stream' as const,
      data: post,
      id: `stream-${post.id}`
    }));

    if (focusedPostId) {
      return effectiveFeed.filter(item => 
        item.type === 'stream' && item.data.id === focusedPostId
      );
    }
    return effectiveFeed;
  }, [feed, posts, focusedPostId]);

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      onTouchStart={stopTouchPropagation}
      onTouchMove={stopTouchPropagation}
    >
      {focusedPostId && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFocusPost(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to feed
          </Button>
        </div>
      )}

      {isLoading && displayedFeed.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && displayedFeed.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground text-lg">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-2">
            Follow teams and leagues to see personalized content
          </p>
        </div>
      )}

      {displayedFeed.map((item) => {
        switch (item.type) {
          case 'stream':
            return (
              <div key={item.id} className="border-b border-border/50">
                <PostItem
                  post={item.data}
                  isDetailView={focusedPostId === item.data.id}
                  expandedComments={expandedComments[item.data.id] || false}
                  isLoadingComments={commentsLoading[item.data.id] || false}
                  onFocusPost={onFocusPost}
                  onAddComment={onAddComment}
                  onToggleComments={onToggleComments}
                  createReactionHandlers={createReactionHandlers}
                  getPostReactions={getPostReactions}
                  getPostComments={getPostComments}
                />
              </div>
            );
          
          case 'highlight': {
            // Extract highlightId from item.id (format: "highlight-{uuid}")
            const highlightId = item.id.replace('highlight-', '');
            // Get RPC highlight data and transform to HighlightPost
            const rpcData = (item.data as any)?.raw || item.data;
            const highlightData = rpcData as RpcHighlightData;
            const itemTs = (item as any).ts || new Date().toISOString();
            const highlightPost = transformRpcHighlightToPost(highlightId, itemTs, highlightData);
            
            return (
              <div key={item.id} className="border-b border-border/50">
                <HighlightPostComponent
                  post={highlightPost}
                  reactions={hybridReactions?.getHighlightReactions(highlightId) || { likes: 0, comments: 0, shares: 0, userLiked: false }}
                  comments={hybridReactions?.getHighlightComments(highlightId) || []}
                  showComments={hybridReactions?.isHighlightCommentsOpen(highlightId) || false}
                  isLoadingComments={hybridReactions?.isHighlightCommentsLoading(highlightId) || false}
                  onAddComment={(text) => hybridReactions?.addHighlightComment(highlightId, text)}
                  onToggleComments={() => hybridReactions?.toggleHighlightComments(highlightId)}
                  reactionHandlers={hybridReactions?.createHighlightReactionHandlers(highlightId) || { onLike: () => {}, onComment: () => {}, onShare: () => {} }}
                />
              </div>
            );
          }
          
          case 'match': {
            const matchData = item.data as any;
            const matchId = matchData.id;
            
            return (
              <UnifiedMatchCard
                key={item.id}
                match={matchData}
                variant="feed"
                onClick={() => navigate(`/match-details/${matchData.id}`)}
                reactions={hybridReactions?.getMatchReactions(matchId)}
                comments={hybridReactions?.getMatchComments(matchId)}
                showComments={hybridReactions?.isMatchCommentsOpen(matchId)}
                isLoadingComments={hybridReactions?.isMatchCommentsLoading(matchId)}
                onAddComment={(text) => hybridReactions?.addMatchComment(matchId, text)}
                onToggleComments={() => hybridReactions?.toggleMatchComments(matchId)}
                onLike={() => hybridReactions?.createMatchReactionHandlers(matchId, () => hybridReactions?.toggleMatchComments(matchId)).onLike?.()}
              />
            );
          }
          
          default:
            return null;
        }
      })}

      {!focusedPostId && hasNextPage && (
        <div ref={targetRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-muted-foreground text-sm">Scroll to load more</span>
          )}
        </div>
      )}
    </div>
  );
}
