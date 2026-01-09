import { useState, useCallback } from 'react';

/**
 * Simplified hook for post actions state management
 * Encapsulates comment expansion and share count state
 * No external function dependencies - fully self-contained
 */
export const usePostActions = () => {
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [shareCount, setShareCount] = useState<Record<string, number>>({});

  const toggleComments = useCallback((postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  }, []);

  const handleShare = useCallback((postId: string) => {
    setShareCount(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
  }, []);

  const isCommentsExpanded = useCallback((postId: string) => {
    return expandedComments[postId] || false;
  }, [expandedComments]);

  const getShareCount = useCallback((postId: string) => {
    return shareCount[postId] || 0;
  }, [shareCount]);

  return {
    expandedComments,
    shareCount,
    toggleComments,
    handleShare,
    isCommentsExpanded,
    getShareCount
  };
};
