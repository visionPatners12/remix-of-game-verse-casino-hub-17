import { useState, useCallback, useEffect, useRef } from 'react';
import { useHighlightReactions } from '@/features/highlights/hooks/useHighlightReactions';
import { useMatchReactions } from '@/features/sports/hooks/useMatchReactions';
import { useAuth } from '@/features/auth';
import { formatRelativeTime } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import type { HybridFeedItem } from '@/types/hybrid-feed';
import type { ReactionCounts, ReactionHandlers } from '@/types/feed';
import type { Comment } from '@/features/social-feed/components/shared/CommentSection';

// Rate limiting: minimum 500ms between like actions
const LIKE_THROTTLE_MS = 500;

const DEFAULT_REACTIONS: ReactionCounts = {
  likes: 0,
  comments: 0,
  shares: 0,
  userLiked: false,
};

// Check if timestamp is already formatted (like "now", "5m", "2h", "3d", "21 Dec")
const isAlreadyFormatted = (ts: string): boolean =>
  /^(now|\d+[mhd]|\d+\s\w{3})$/.test(ts);

// GIF data type for comments
interface GifData {
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

// Normalize any comment format to the expected Comment type
function normalizeComment(raw: any): Comment {
  const rawTimestamp = raw.timestamp || raw.created_at || new Date().toISOString();
  
  return {
    id: raw.id || '',
    username: raw.username || 'anonymous',
    fullName: raw.fullName || raw.username || 'Anonymous',
    displayUsername: raw.displayUsername || `@${raw.username || 'anonymous'}`,
    avatar: raw.avatar,
    text: raw.text || raw.content || '',
    timestamp: isAlreadyFormatted(rawTimestamp) 
      ? rawTimestamp 
      : formatRelativeTime(rawTimestamp),
    gif: raw.gif,
  };
}

interface HybridFeedReactionsResult {
  // Highlight reactions
  getHighlightReactions: (id: string) => ReactionCounts;
  getHighlightComments: (id: string) => Comment[];
  isHighlightCommentsOpen: (id: string) => boolean;
  isHighlightCommentsLoading: (id: string) => boolean;
  toggleHighlightComments: (id: string) => Promise<void>;
  addHighlightComment: (id: string, text: string, gif?: GifData) => Promise<void>;
  createHighlightReactionHandlers: (id: string) => ReactionHandlers;
  
  // Match reactions
  getMatchReactions: (id: string) => ReactionCounts;
  getMatchComments: (id: string) => Comment[];
  isMatchCommentsOpen: (id: string) => boolean;
  isMatchCommentsLoading: (id: string) => boolean;
  toggleMatchComments: (id: string) => Promise<void>;
  addMatchComment: (id: string, text: string, gif?: GifData) => Promise<void>;
  createMatchReactionHandlers: (id: string, onToggle: () => void) => Partial<{
    onLike: () => void;
    onComment: () => void;
  }>;
}

/**
 * Combined hook for managing reactions on both highlights and matches in the hybrid feed
 * Optimized: tracks loaded IDs to prevent re-fetching on scroll
 */
export function useHybridFeedReactions(feed: HybridFeedItem[]): HybridFeedReactionsResult {
  const { user } = useAuth();
  
  // Comments state
  const [expandedHighlightComments, setExpandedHighlightComments] = useState<Set<string>>(new Set());
  const [expandedMatchComments, setExpandedMatchComments] = useState<Set<string>>(new Set());
  const [highlightComments, setHighlightComments] = useState<Record<string, Comment[]>>({});
  const [matchComments, setMatchComments] = useState<Record<string, Comment[]>>({});
  const [loadingHighlightComments, setLoadingHighlightComments] = useState<Set<string>>(new Set());
  const [loadingMatchComments, setLoadingMatchComments] = useState<Set<string>>(new Set());

  // Use existing reaction hooks
  const highlightReactionsHook = useHighlightReactions();
  const matchReactionsHook = useMatchReactions();
  
  // Rate limiting refs
  const lastHighlightLikeRef = useRef<Map<string, number>>(new Map());
  const lastMatchLikeRef = useRef<Map<string, number>>(new Map());
  
  // Track loaded IDs to prevent re-fetching on scroll
  const loadedHighlightIdsRef = useRef<Set<string>>(new Set());
  const loadedMatchIdsRef = useRef<Set<string>>(new Set());

  // OPTIMIZED: Load reactions only for NEW items with 300ms debounce to batch requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const allHighlightIds = feed
        .filter(item => item.type === 'highlight')
        .map(item => item.data.id);
      
      const allMatchIds = feed
        .filter(item => item.type === 'match')
        .map(item => item.data.id);

      // Filter out already loaded IDs
      const newHighlightIds = allHighlightIds.filter(id => !loadedHighlightIdsRef.current.has(id));
      const newMatchIds = allMatchIds.filter(id => !loadedMatchIdsRef.current.has(id));

      // Load reactions only for new items (batched after debounce)
      if (newHighlightIds.length > 0) {
        newHighlightIds.forEach(id => loadedHighlightIdsRef.current.add(id));
        highlightReactionsHook.loadReactions(newHighlightIds);
      }
      if (newMatchIds.length > 0) {
        newMatchIds.forEach(id => loadedMatchIdsRef.current.add(id));
        matchReactionsHook.loadReactions(newMatchIds);
      }
    }, 300); // 300ms debounce to batch rapid feed updates
    
    return () => clearTimeout(timeoutId);
  }, [feed]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGHLIGHT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const getHighlightReactions = useCallback((id: string): ReactionCounts => {
    return highlightReactionsHook.reactions[id] || DEFAULT_REACTIONS;
  }, [highlightReactionsHook.reactions]);

  const getHighlightComments = useCallback((id: string): Comment[] => {
    return highlightComments[id] || [];
  }, [highlightComments]);

  const isHighlightCommentsOpen = useCallback((id: string): boolean => {
    return expandedHighlightComments.has(id);
  }, [expandedHighlightComments]);

  const isHighlightCommentsLoading = useCallback((id: string): boolean => {
    return loadingHighlightComments.has(id);
  }, [loadingHighlightComments]);

  const toggleHighlightComments = useCallback(async (id: string) => {
    const isOpen = expandedHighlightComments.has(id);
    
    if (isOpen) {
      setExpandedHighlightComments(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setExpandedHighlightComments(prev => new Set(prev).add(id));
      
      // Load comments if not already loaded
      if (!highlightComments[id]) {
        setLoadingHighlightComments(prev => new Set(prev).add(id));
        try {
          const rawComments = await highlightReactionsHook.loadComments(id);
          const normalized = (rawComments || []).map(normalizeComment);
          setHighlightComments(prev => ({ ...prev, [id]: normalized }));
        } finally {
          setLoadingHighlightComments(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    }
  }, [expandedHighlightComments, highlightComments, highlightReactionsHook]);

  const addHighlightComment = useCallback(async (id: string, text: string, gif?: GifData) => {
    // Optimistic update: add comment locally immediately
    const username = user?.user_metadata?.username || 'user';
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      username,
      fullName: user?.user_metadata?.first_name || username,
      displayUsername: `@${username}`,
      avatar: user?.user_metadata?.avatar_url,
      text,
      timestamp: 'now',
      gif,
    };
    
    setHighlightComments(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), optimisticComment]
    }));
    
    // Send to server (no reload needed thanks to optimistic update)
    await highlightReactionsHook.addComment(id, text, gif);
  }, [highlightReactionsHook, user]);

  const createHighlightReactionHandlers = useCallback((id: string): ReactionHandlers => ({
    onLike: () => {
      // Rate limiting check
      const now = Date.now();
      const lastLikeTime = lastHighlightLikeRef.current.get(id) || 0;
      if (now - lastLikeTime < LIKE_THROTTLE_MS) {
        logger.debug('Highlight like throttled:', id);
        return;
      }
      lastHighlightLikeRef.current.set(id, now);
      highlightReactionsHook.toggleLike(id);
    },
    onComment: () => toggleHighlightComments(id),
    onShare: () => {
      // Share functionality
      if (navigator.share) {
        navigator.share({ url: `${window.location.origin}/highlight/${id}` });
      }
    },
  }), [highlightReactionsHook, toggleHighlightComments]);

  // ─────────────────────────────────────────────────────────────────────────────
  // MATCH HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const getMatchReactions = useCallback((id: string): ReactionCounts => {
    const reaction = matchReactionsHook.reactions[id];
    if (!reaction) return DEFAULT_REACTIONS;
    return {
      likes: reaction.likes,
      comments: reaction.comments,
      shares: 0,
      userLiked: reaction.userLiked,
    };
  }, [matchReactionsHook.reactions]);

  const getMatchComments = useCallback((id: string): Comment[] => {
    return matchComments[id] || [];
  }, [matchComments]);

  const isMatchCommentsOpen = useCallback((id: string): boolean => {
    return expandedMatchComments.has(id);
  }, [expandedMatchComments]);

  const isMatchCommentsLoading = useCallback((id: string): boolean => {
    return loadingMatchComments.has(id);
  }, [loadingMatchComments]);

  const toggleMatchComments = useCallback(async (id: string) => {
    const isOpen = expandedMatchComments.has(id);
    
    if (isOpen) {
      setExpandedMatchComments(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setExpandedMatchComments(prev => new Set(prev).add(id));
      
      // Load comments if not already loaded
      if (!matchComments[id]) {
        setLoadingMatchComments(prev => new Set(prev).add(id));
        try {
          const rawComments = await matchReactionsHook.loadComments(id);
          const normalized = (rawComments || []).map(normalizeComment);
          setMatchComments(prev => ({ ...prev, [id]: normalized }));
        } finally {
          setLoadingMatchComments(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    }
  }, [expandedMatchComments, matchComments, matchReactionsHook]);

  const addMatchComment = useCallback(async (id: string, text: string, gif?: GifData) => {
    // Optimistic update: add comment locally immediately
    const username = user?.user_metadata?.username || 'user';
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      username,
      fullName: user?.user_metadata?.first_name || username,
      displayUsername: `@${username}`,
      avatar: user?.user_metadata?.avatar_url,
      text,
      timestamp: 'now',
      gif,
    };
    
    setMatchComments(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), optimisticComment]
    }));
    
    // Send to server (no reload needed thanks to optimistic update)
    await matchReactionsHook.addComment(id, text, gif);
  }, [matchReactionsHook, user]);

  const createMatchReactionHandlers = useCallback((id: string, onToggle: () => void) => ({
    onLike: () => {
      // Rate limiting check
      const now = Date.now();
      const lastLikeTime = lastMatchLikeRef.current.get(id) || 0;
      if (now - lastLikeTime < LIKE_THROTTLE_MS) {
        logger.debug('Match like throttled:', id);
        return;
      }
      lastMatchLikeRef.current.set(id, now);
      matchReactionsHook.toggleLike(id);
    },
    onComment: onToggle,
  }), [matchReactionsHook]);

  return {
    // Highlight
    getHighlightReactions,
    getHighlightComments,
    isHighlightCommentsOpen,
    isHighlightCommentsLoading,
    toggleHighlightComments,
    addHighlightComment,
    createHighlightReactionHandlers,
    // Match
    getMatchReactions,
    getMatchComments,
    isMatchCommentsOpen,
    isMatchCommentsLoading,
    toggleMatchComments,
    addMatchComment,
    createMatchReactionHandlers,
  };
}
