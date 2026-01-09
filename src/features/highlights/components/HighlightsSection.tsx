import React, { useEffect, useState } from 'react';
import { useFilteredHighlights } from '../hooks/useFilteredHighlights';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useHighlightReactions } from '../hooks/useHighlightReactions';
import { transformHighlightToPost } from '../utils/highlightToPost';
import { HighlightPostComponent } from '@/features/posts/components/types/HighlightPostComponent';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getComments } from '../services/highlightReactionService';
import type { Comment } from '@/types/feed';

/**
 * Highlights section - displays highlights as feed posts (read-only, no interactions)
 */
export function HighlightsSection() {
  const { toast } = useToast();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFilteredHighlights({ pageSize: 20 });

  const { reactions, toggleLike, addComment, loadReactions } = useHighlightReactions();
  
  // Comment management state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [highlightComments, setHighlightComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  // Infinite scroll trigger
  const { elementRef, isInView } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '100px',
  });

  // Auto-load when sentinel is visible
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten pages
  const allHighlights = data?.pages.flatMap(page => page.highlights) || [];

  // Load reactions when highlights change
  useEffect(() => {
    if (allHighlights.length > 0) {
      const ids = allHighlights.map(h => h.id);
      loadReactions(ids);
    }
  }, [allHighlights.length]);


  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto py-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Une erreur est survenue
      </div>
    );
  }

  const handleToggleComments = async (highlightId: string) => {
    const newExpanded = new Set(expandedComments);
    
    if (newExpanded.has(highlightId)) {
      newExpanded.delete(highlightId);
    } else {
      newExpanded.add(highlightId);
      
      // Lazy load comments if not already loaded
      if (!highlightComments[highlightId]) {
        setLoadingComments(prev => new Set(prev).add(highlightId));
        
        try {
          const comments = await getComments(highlightId);
          setHighlightComments(prev => ({ ...prev, [highlightId]: comments }));
        } catch (error) {
          console.error('Failed to load comments:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les commentaires",
            variant: "destructive"
          });
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

  const handleAddComment = async (highlightId: string, text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => {
    try {
      await addComment(highlightId, text, gif);
      
      // Reload comments to show the new one
      const comments = await getComments(highlightId);
      setHighlightComments(prev => ({ ...prev, [highlightId]: comments }));
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (highlightId: string) => {
    const url = `${window.location.origin}/highlight/${highlightId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this highlight',
          url: url
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The highlight link has been copied to your clipboard."
        });
      } catch (err) {
        toast({
          title: "Could not copy link",
          description: "Please copy the URL manually from your browser.",
          variant: "destructive"
        });
      }
    }
  };

  const defaultReactions = {
    likes: 0,
    comments: 0,
    shares: 0,
    userLiked: false,
  };

  return (
    <div className="space-y-6 py-6 md:p-6">
      <div className="space-y-4 max-w-2xl mx-auto">
        {allHighlights.map((highlight) => {
          const highlightReactions = reactions[highlight.id] || defaultReactions;
          const isCommentsOpen = expandedComments.has(highlight.id);
          const comments = highlightComments[highlight.id] || [];
          const isCommentsLoading = loadingComments.has(highlight.id);
          
          return (
            <HighlightPostComponent
              key={highlight.id}
              post={transformHighlightToPost(highlight)}
              reactions={highlightReactions}
              comments={comments}
              showComments={isCommentsOpen}
              isLoadingComments={isCommentsLoading}
              onAddComment={(text) => { handleAddComment(highlight.id, text); }}
              onToggleComments={() => handleToggleComments(highlight.id)}
              reactionHandlers={{
                onLike: () => toggleLike(highlight.id),
                onComment: () => handleToggleComments(highlight.id),
                onShare: () => handleShare(highlight.id),
              }}
            />
          );
        })}

        {/* Sentinel for infinite scroll */}
        {hasNextPage && (
          <div ref={elementRef} className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!hasNextPage && allHighlights.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Tous les highlights ont été chargés
          </p>
        )}

        {allHighlights.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">
            Aucun highlight disponible pour le moment
          </p>
        )}
      </div>
    </div>
  );
}
