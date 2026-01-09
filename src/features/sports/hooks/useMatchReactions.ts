import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Comment } from '@/features/social-feed/components/shared/CommentSection';
import * as matchReactionService from '../services/matchReactionService';

interface MatchReactions {
  [matchId: string]: {
    likes: number;
    comments: number;
    userLiked: boolean;
  };
}

/**
 * Hook to manage reactions (likes/comments) for matches via Supabase
 * Uses batch RPC to reduce number of requests
 */
export function useMatchReactions() {
  const [reactions, setReactions] = useState<MatchReactions>({});
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Load reactions for multiple matches using batch RPC
   * Now fetches counts AND userLiked status in a single call
   */
  const loadReactions = useCallback(async (matchIds: string[]) => {
    if (matchIds.length === 0) return;

    try {
      // Single RPC call returns likes, comments, and userLiked for all matches
      const batchData = await matchReactionService.batchLoadReactions(matchIds, user?.id);

      setReactions(prev => ({
        ...prev,
        ...batchData,
      }));
    } catch (error) {
      console.error('Error loading match reactions:', error);
    }
  }, [user?.id]);

  /**
   * Toggle like on a match
   */
  const toggleLike = useCallback(async (matchId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like matches",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const currentReactions = reactions[matchId];
    const wasLiked = currentReactions?.userLiked || false;
    
    setReactions(prev => ({
      ...prev,
      [matchId]: {
        likes: (prev[matchId]?.likes || 0) + (wasLiked ? -1 : 1),
        comments: prev[matchId]?.comments || 0,
        userLiked: !wasLiked
      }
    }));

    try {
      await matchReactionService.toggleLike(matchId, user.id);
    } catch (error) {
      // Revert on error
      setReactions(prev => ({
        ...prev,
        [matchId]: {
          ...currentReactions,
          userLiked: wasLiked
        }
      }));
      
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  }, [user, reactions, toast]);

  /**
   * Add comment to a match
   */
  const addComment = useCallback(async (
    matchId: string, 
    content: string,
    gifData?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !gifData) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const currentReactions = reactions[matchId];
    setReactions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        comments: (prev[matchId]?.comments || 0) + 1
      }
    }));

    try {
      await matchReactionService.addComment(matchId, user.id, content, gifData);

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      // Revert on error
      setReactions(prev => ({
        ...prev,
        [matchId]: {
          ...currentReactions
        }
      }));
      
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  }, [user, reactions, toast]);

  /**
   * Load comments for a match
   */
  const loadComments = useCallback(async (matchId: string): Promise<Comment[]> => {
    try {
      const comments = await matchReactionService.getComments(matchId);
      return comments;
    } catch (error) {
      console.error('Error loading match comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    reactions,
    toggleLike,
    addComment,
    loadReactions,
    loadComments
  };
}
