import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteHighlights } from '@/features/highlights/hooks/useInfiniteHighlights';
import { useHighlightReactions } from '@/features/highlights/hooks/useHighlightReactions';
import { transformHighlightToPost } from '@/features/highlights/utils/highlightToPost';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { HighlightPostComponent } from '@/features/posts/components/types/HighlightPostComponent';
import { getComments } from '@/features/highlights/services/highlightReactionService';
import type { Comment } from '@/types/feed';
import { Loader2 } from 'lucide-react';

interface EntityFeedProps {
  entityType: 'league' | 'team';
  entityId: string;
}

/**
 * Generic entity feed component - displays highlight posts with infinite scroll
 * Replaces both LeagueFeed and TeamFeed with a single DRY component
 */
export function EntityFeed({ entityType, entityId }: EntityFeedProps) {
  const { t } = useTranslation('pages');
  
  const hookParams = entityType === 'league' 
    ? { leagueId: entityId, pageSize: 20 }
    : { teamId: entityId, pageSize: 20 };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteHighlights(hookParams);

  const { reactions, toggleLike, addComment, loadReactions } = useHighlightReactions();
  
  // Comment management state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [highlightComments, setHighlightComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  
  const { elementRef, isInView } = useIntersectionObserver({ threshold: 0.5 });

  // Trigger fetchNextPage when sentinel is in view
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten pages and transform highlights
  const allHighlights = data?.pages.flatMap(page => page.highlights) || [];
  const posts = allHighlights.map(transformHighlightToPost);

  // Load reactions when highlights change
  useEffect(() => {
    if (allHighlights.length > 0) {
      const highlightIds = allHighlights.map(h => h.id);
      loadReactions(highlightIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allHighlights.length]);

  // Toggle comments visibility and lazy load
  const handleToggleComments = async (highlightId: string) => {
    const newExpanded = new Set(expandedComments);
    const isCurrentlyExpanded = expandedComments.has(highlightId);
    
    if (isCurrentlyExpanded) {
      newExpanded.delete(highlightId);
    } else {
      newExpanded.add(highlightId);
      
      // Lazy load comments if not already loaded
      if (!highlightComments[highlightId]) {
        setLoadingComments(prev => new Set(prev).add(highlightId));
        
        try {
          const comments = await getComments(highlightId);
          setHighlightComments(prev => ({ ...prev, [highlightId]: comments }));
        } catch (err) {
          console.error('Failed to load comments:', err);
        } finally {
          setLoadingComments(prev => {
            const next = new Set(prev);
            next.delete(highlightId);
            return next;
          });
        }
      }
    }
    
    setExpandedComments(newExpanded);
  };

  // Handle adding a comment
  const handleAddComment = async (highlightId: string, text: string) => {
    try {
      await addComment(highlightId, text);
      
      // Reload comments to show the new one
      const comments = await getComments(highlightId);
      setHighlightComments(prev => ({ ...prev, [highlightId]: comments }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Handle like
  const handleLike = async (highlightId: string) => {
    await toggleLike(highlightId);
  };

  // Handle share
  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('league.feed.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('league.feed.error')}</div>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('league.feed.empty')}</div>
      </div>
    );
  }

  const defaultReactions = { likes: 0, comments: 0, shares: 0, userLiked: false };

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const highlight = allHighlights.find(h => h.id === post.id);
        if (!highlight) return null;
        
        const highlightReactions = reactions[highlight.id] || defaultReactions;
        const isCommentsOpen = expandedComments.has(highlight.id);
        const comments = highlightComments[highlight.id] || [];
        const isCommentsLoading = loadingComments.has(highlight.id);
        
        return (
          <HighlightPostComponent
            key={post.id}
            post={post}
            reactions={highlightReactions}
            comments={comments}
            showComments={isCommentsOpen}
            isLoadingComments={isCommentsLoading}
            onAddComment={(text) => handleAddComment(highlight.id, text)}
            onToggleComments={() => handleToggleComments(highlight.id)}
            reactionHandlers={{
              onLike: () => handleLike(highlight.id),
              onComment: () => handleToggleComments(highlight.id),
              onShare: () => handleShare(post.id),
            }}
          />
        );
      })}

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={elementRef} className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* End of content message */}
      {!hasNextPage && posts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">{t('league.feed.allLoaded')}</div>
        </div>
      )}
    </div>
  );
}
