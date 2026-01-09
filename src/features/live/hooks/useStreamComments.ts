import { useState, useCallback, useRef } from 'react';
import { getComments } from '@/services/getstream/reactionService';
import { useGetStream } from '@/contexts/StreamProvider';
import { formatFullName } from '@/utils/feedHelpers';
import { formatRelativeTime } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import type { Comment } from '@/types/feed';
import type { StreamClient } from 'getstream';

interface UseStreamCommentsResult {
  comments: Record<string, Comment[]>;
  isLoading: Record<string, boolean>;
  loadComments: (activityId: string, forceReload?: boolean) => Promise<void>;
  addCommentToActivity: (activityId: string, comment: Comment) => void;
  getCommentsForActivity: (activityId: string) => Comment[];
}

export function useStreamComments(): UseStreamCommentsResult {
  const { client } = useGetStream();
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const loadingRef = useRef<Set<string>>(new Set());
  // PERF: Use ref to check loaded state without dependency on comments
  const loadedRef = useRef<Set<string>>(new Set());

  const loadComments = useCallback(async (activityId: string, forceReload = false) => {
    if (!client) return;
    
    // Prevent duplicate requests
    if (loadingRef.current.has(activityId)) return;
    
    // PERF FIX: Check ref instead of state to avoid stale closure
    if (!forceReload && loadedRef.current.has(activityId)) return;

    loadingRef.current.add(activityId);
    setIsLoading(prev => ({ ...prev, [activityId]: true }));

    try {
      const response = await getComments(client as StreamClient, activityId);
      const formattedComments: Comment[] = response.results.map((comment: unknown) => {
        const data = comment as { 
          id: string; 
          data?: { 
            text?: string;
            gif?: {
              url?: string;
              previewUrl?: string;
              width?: number;
              height?: number;
              alt?: string;
            };
          }; 
          user?: {
            data?: {
              username?: string;
              first_name?: string;
              last_name?: string;
              avatar?: string;
            };
          };
          created_at: string; 
        };
        
        const userData = data.user?.data;
        // DRY: Use shared formatFullName helper
        const fullName = formatFullName(userData?.first_name, userData?.last_name, userData?.username);
        const displayUsername = userData?.username ? `@${userData.username}` : '';
        
        // Extract GIF data if present
        const gifData = data.data?.gif?.url ? {
          url: data.data.gif.url,
          previewUrl: data.data.gif.previewUrl,
          width: data.data.gif.width,
          height: data.data.gif.height,
          alt: data.data.gif.alt,
        } : undefined;
        
        return {
          id: data.id,
          username: userData?.username || 'user',
          fullName,
          displayUsername,
          avatar: userData?.avatar,
          text: data.data?.text || '',
          timestamp: formatRelativeTime(data.created_at),
          gif: gifData,
        };
      });

      loadedRef.current.add(activityId);
      setComments(prev => ({ ...prev, [activityId]: formattedComments }));
    } catch (error) {
      logger.error('Failed to load comments', error);
      setComments(prev => ({ ...prev, [activityId]: [] }));
    } finally {
      loadingRef.current.delete(activityId);
      setIsLoading(prev => ({ ...prev, [activityId]: false }));
    }
  }, [client]); // PERF: Removed comments from deps

  // Add a single comment optimistically (used after addComment)
  const addCommentToActivity = useCallback((activityId: string, comment: Comment) => {
    setComments(prev => ({
      ...prev,
      [activityId]: [...(prev[activityId] || []), comment]
    }));
  }, []);

  const getCommentsForActivity = useCallback((activityId: string): Comment[] => {
    return comments[activityId] || [];
  }, [comments]);

  return {
    comments,
    isLoading,
    loadComments,
    addCommentToActivity,
    getCommentsForActivity
  };
}
