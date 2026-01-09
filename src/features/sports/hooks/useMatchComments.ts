import { useState, useEffect, useCallback } from 'react';
import { useMatchReactions } from './useMatchReactions';
import type { Comment } from '@/features/social-feed/components/shared/CommentSection';

interface GifData {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface UseMatchCommentsOptions {
  matchIds: string[];
}

/**
 * Hook to manage match comments state and interactions
 * Encapsulates expandedComments, matchComments, loadingComments states
 * and the handlers for toggling comments, adding comments, and liking matches
 */
export function useMatchComments({ matchIds }: UseMatchCommentsOptions) {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [matchComments, setMatchComments] = useState<Map<string, Comment[]>>(new Map());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  
  const { reactions, toggleLike, addComment, loadReactions, loadComments } = useMatchReactions();

  // Load reactions when match IDs change
  useEffect(() => {
    const validIds = matchIds.filter(Boolean);
    if (validIds.length > 0) {
      loadReactions(validIds);
    }
  }, [matchIds, loadReactions]);

  const handleToggleComments = useCallback(async (matchId: string) => {
    const newExpanded = new Set(expandedComments);
    
    if (newExpanded.has(matchId)) {
      newExpanded.delete(matchId);
      setExpandedComments(newExpanded);
    } else {
      newExpanded.add(matchId);
      setExpandedComments(newExpanded);
      
      // Lazy load comments if not already loaded
      if (!matchComments.has(matchId)) {
        setLoadingComments(prev => new Set(prev).add(matchId));
        const comments = await loadComments(matchId);
        setMatchComments(prev => new Map(prev).set(matchId, comments));
        setLoadingComments(prev => {
          const next = new Set(prev);
          next.delete(matchId);
          return next;
        });
      }
    }
  }, [expandedComments, matchComments, loadComments]);

  const handleAddComment = useCallback(async (
    matchId: string, 
    text: string, 
    gif?: GifData
  ) => {
    await addComment(matchId, text, gif);
    // Reload comments after adding
    const comments = await loadComments(matchId);
    setMatchComments(prev => new Map(prev).set(matchId, comments));
  }, [addComment, loadComments]);

  const handleLike = useCallback((matchId: string) => {
    toggleLike(matchId);
  }, [toggleLike]);

  return {
    expandedComments,
    matchComments,
    loadingComments,
    reactions,
    handleToggleComments,
    handleAddComment,
    handleLike,
  };
}
