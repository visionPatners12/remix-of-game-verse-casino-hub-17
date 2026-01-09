import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ReactionCounts } from '@/types/feed';
import * as reactionService from '../services/highlightReactionService';

interface HighlightReactions {
  [highlightId: string]: ReactionCounts;
}

/**
 * Hook to manage reactions (likes/comments) for highlights via Supabase
 * Uses batch RPC to reduce number of requests
 */
export function useHighlightReactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState<HighlightReactions>({});

  /**
   * Load reactions for multiple highlights using batch RPC
   * Now fetches counts AND userLiked status in a single call
   */
  const loadReactions = useCallback(async (highlightIds: string[]) => {
    if (highlightIds.length === 0) return;
    
    try {
      // Single RPC call returns likes, comments, and userLiked for all highlights
      const results = await reactionService.batchLoadReactions(highlightIds, user?.id);
      
      const newReactions: HighlightReactions = {};
      results.forEach(({ highlightId, likes, comments, userLiked }) => {
        newReactions[highlightId] = {
          likes,
          comments,
          shares: 0,
          userLiked,
        };
      });

      setReactions(prev => ({
        ...prev,
        ...newReactions,
      }));
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  }, [user?.id]);

  /**
   * Toggle like for a highlight
   */
  const toggleLike = useCallback(async (highlightId: string) => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like highlights',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    setReactions((prev) => {
      const current = prev[highlightId] || { likes: 0, comments: 0, shares: 0, userLiked: false };
      return {
        ...prev,
        [highlightId]: {
          ...current,
          likes: current.userLiked ? current.likes - 1 : current.likes + 1,
          userLiked: !current.userLiked,
        },
      };
    });

    try {
      await reactionService.toggleLike(highlightId, user.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setReactions((prev) => {
        const current = prev[highlightId] || { likes: 0, comments: 0, shares: 0, userLiked: false };
        return {
          ...prev,
          [highlightId]: {
            ...current,
            likes: current.userLiked ? current.likes + 1 : current.likes - 1,
            userLiked: !current.userLiked,
          },
        };
      });
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  /**
   * Add a comment to a highlight
   */
  const addComment = useCallback(async (
    highlightId: string, 
    content: string,
    gifData?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim() && !gifData) {
      toast({
        title: 'Invalid comment',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    setReactions((prev) => {
      const current = prev[highlightId] || { likes: 0, comments: 0, shares: 0, userLiked: false };
      return {
        ...prev,
        [highlightId]: {
          ...current,
          comments: current.comments + 1,
        },
      };
    });

    try {
      await reactionService.addComment(highlightId, user.id, content, gifData);
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revert optimistic update
      setReactions((prev) => {
        const current = prev[highlightId] || { likes: 0, comments: 0, shares: 0, userLiked: false };
        return {
          ...prev,
          [highlightId]: {
            ...current,
            comments: Math.max(0, current.comments - 1),
          },
        };
      });
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  /**
   * Load comments for a highlight
   */
  const loadComments = useCallback(async (highlightId: string) => {
    try {
      return await reactionService.getComments(highlightId);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  return {
    reactions,
    toggleLike,
    addComment,
    loadReactions,
    loadComments,
  };
}
