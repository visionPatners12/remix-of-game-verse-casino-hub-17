import { useState, useCallback } from 'react';
import { addLike, removeLike, addComment, getLikes, getComments, checkUserLike } from '@/services/getstream/reactionService';
import { useGetStream } from '@/contexts/StreamProvider';
import { logger } from '@/utils/logger';
import type { ReactionCounts, Author } from '@/types/feed';
import type { StreamClient } from 'getstream';

/**
 * GetStream reaction data structure passed to initializeReactions
 */
interface StreamReactionInput {
  reaction_counts?: {
    like?: number;
    comment?: number;
    share?: number;
  };
  own_reactions?: {
    like?: unknown[];
    comment?: unknown[];
  };
  latest_reactions?: {
    like?: unknown[];
    comment?: unknown[];
  };
}

export const useStreamReactions = () => {
  const { client, isReady } = useGetStream();
  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>({});

  // Initialize reactions from GetStream data
  const initializeReactions = useCallback((activityId: string, reactionData: StreamReactionInput | null | undefined) => {
    if (reactionData) {
      const newData: ReactionCounts = {
        likes: reactionData.reaction_counts?.like || 0,
        comments: reactionData.reaction_counts?.comment || 0,
        shares: reactionData.reaction_counts?.share || 0,
        userLiked: Boolean(reactionData.own_reactions?.like && reactionData.own_reactions.like.length > 0)
      };
      
      logger.stream('📊 Initializing reactions for activity:', activityId, reactionData.reaction_counts, reactionData.own_reactions, newData);

      setReactions(prev => {
        const existing = prev[activityId];
        
        if (existing && 
            existing.likes === newData.likes && 
            existing.comments === newData.comments && 
            existing.shares === newData.shares && 
            existing.userLiked === newData.userLiked) {
          return prev;
        }
        
        return { ...prev, [activityId]: newData };
      });
    }
  }, []);

  const handleLike = useCallback(async (activityId: string, user: Author) => {
    if (!client || !isReady) {
      logger.warn('GetStream client not ready, cannot like');
      return;
    }

    setReactions(prev => {
      const currentReaction = prev[activityId];
      if (currentReaction?.userLiked) {
        logger.debug('User already liked this activity:', activityId);
        return prev;
      }

      return {
        ...prev,
        [activityId]: {
          ...prev[activityId],
          likes: (prev[activityId]?.likes || 0) + 1,
          userLiked: true,
        }
      };
    });

    try {
      await addLike(client as StreamClient, activityId, user);
      logger.debug('Like added to activity:', activityId);
    } catch (error) {
      logger.error('Failed to add like:', error);
      setReactions(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          likes: Math.max((prev[activityId]?.likes || 1) - 1, 0),
          userLiked: false,
        }
      }));
    }
  }, [client, isReady]);


  const handleUnlike = useCallback(async (activityId: string, userId: string) => {
    if (!client || !isReady) {
      logger.warn('GetStream client not ready, cannot unlike');
      return;
    }

    setReactions(prev => {
      const currentReaction = prev[activityId];
      if (!currentReaction?.userLiked) {
        logger.debug('User has not liked this activity:', activityId);
        return prev;
      }

      return {
        ...prev,
        [activityId]: {
          ...prev[activityId],
          likes: Math.max((prev[activityId]?.likes || 1) - 1, 0),
          userLiked: false,
        }
      };
    });

    try {
      await removeLike(client as StreamClient, activityId, userId);
      logger.debug('Like removed from activity:', activityId);
    } catch (error) {
      logger.error('Failed to remove like:', error);
      // Rollback on error
      setReactions(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          likes: (prev[activityId]?.likes || 0) + 1,
          userLiked: true,
        }
      }));
    }
  }, [client, isReady]);

  const handleComment = useCallback(async (
    activityId: string, 
    text: string, 
    user: Author,
    gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }
  ): Promise<{ id: string; created_at: string } | null> => {
    logger.debug('🎯 handleComment called:', { activityId, text, user, gif });
    
    if (!text.trim() && !gif) return null;
    if (!user) {
      logger.warn('No user available for comment');
      return null;
    }

    if (!client || !isReady) {
      logger.warn('GetStream client not ready, cannot comment');
      return null;
    }

    // Optimistically update comment count
    setReactions(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        comments: (prev[activityId]?.comments || 0) + 1
      }
    }));
    
    try {
      logger.debug('📡 Calling addComment service...');
      const response = await addComment(client as StreamClient, activityId, text.trim(), user, gif);
      logger.debug('✅ Comment service response:', response);
      
      logger.debug('Comment added to activity:', activityId);
      return response as { id: string; created_at: string };
    } catch (error) {
      logger.error('❌ handleComment error:', error);
      logger.error('Failed to add comment:', error);
      
      setReactions(prev => ({
        ...prev,
        [activityId]: {
          ...prev[activityId],
          comments: Math.max((prev[activityId]?.comments || 1) - 1, 0),
        }
      }));
      
      throw error;
    }
  }, [client, isReady]);

  const loadReactions = useCallback(async (activityId: string, userId?: string) => {
    if (!client || !isReady) {
      logger.warn('GetStream client not ready, cannot load reactions');
      return;
    }

    try {
      const [likesResponse, commentsResponse, userLikeResponse] = await Promise.all([
        getLikes(client as StreamClient, activityId),
        getComments(client as StreamClient, activityId),
        userId ? checkUserLike(client as StreamClient, activityId, userId) : Promise.resolve({ results: [] })
      ]);

      const likes = likesResponse.results?.length || 0;
      const comments = commentsResponse.results?.length || 0;
      const userLiked = (userLikeResponse.results?.length || 0) > 0;
      
      setReactions(prev => ({
        ...prev,
        [activityId]: {
          likes,
          comments,
          shares: 0,
          userLiked,
        }
      }));
    } catch (error) {
      logger.error('Failed to load reactions for activity:', activityId, error);
    }
  }, [client, isReady]);

  const getReactionCounts = useCallback((activityId: string): ReactionCounts => {
    return reactions[activityId] || { likes: 0, comments: 0, shares: 0, userLiked: false };
  }, [reactions]);

  return {
    handleLike,
    handleUnlike,
    handleComment,
    loadReactions,
    getReactionCounts,
    initializeReactions,
    reactions
  };
};
