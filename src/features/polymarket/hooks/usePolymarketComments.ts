import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, polymarketClient } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GifData } from '@/components/ui/gif-picker';

export interface PolymarketComment {
  id: string;
  user_id: string;
  event_id: string | null;
  market_id: string | null;
  content: string;
  gif_url: string | null;
  gif_preview_url: string | null;
  gif_width: number | null;
  gif_height: number | null;
  created_at: string;
  updated_at: string;
  // User data from join
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

// Query key factory
const COMMENTS_KEYS = {
  list: (eventId: string) => ['polymarket', 'comments', eventId] as const,
};

export function usePolymarketComments(eventId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch comments for event with user data
  const { data: comments = [], isLoading } = useQuery({
    queryKey: COMMENTS_KEYS.list(eventId || ''),
    queryFn: async (): Promise<PolymarketComment[]> => {
      if (!eventId) return [];

      // 1. Fetch comments from polymarket schema
      const { data: commentsData, error } = await polymarketClient
        .from('comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!commentsData || commentsData.length === 0) return [];

      // 2. Get unique user IDs
      const userIds = [...new Set(commentsData.map((c) => c.user_id))] as string[];

      // 3. Fetch user data from public.users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, avatar_url')
        .in('id', userIds);

      // 4. Create map for quick lookup
      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      // 5. Merge user data with comments
      return commentsData.map((comment) => ({
        ...comment,
        username: usersMap.get(comment.user_id)?.username || null,
        first_name: usersMap.get(comment.user_id)?.first_name || null,
        last_name: usersMap.get(comment.user_id)?.last_name || null,
        avatar_url: usersMap.get(comment.user_id)?.avatar_url || null,
      }));
    },
    enabled: !!eventId,
    staleTime: 30000,
  });

  // Use local count (always accurate)
  const commentsCount = comments.length;

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, gif }: { content: string; gif?: GifData }) => {
      if (!eventId || !userId) {
        throw new Error('Must be logged in to comment');
      }

      const commentData = {
        event_id: eventId,
        user_id: userId,
        content: content.trim(),
        gif_url: gif?.url || null,
        gif_preview_url: gif?.previewUrl || null,
        gif_width: gif?.width || null,
        gif_height: gif?.height || null,
      };

      const { data, error } = await polymarketClient
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEYS.list(eventId || '') });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add comment',
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!userId) {
        throw new Error('Must be logged in to delete');
      }

      const { error } = await polymarketClient
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEYS.list(eventId || '') });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete comment',
        variant: 'destructive',
      });
    },
  });

  const addComment = useCallback((content: string, gif?: GifData) => {
    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please login to comment',
        variant: 'destructive',
      });
      return;
    }
    if (!content.trim() && !gif) {
      toast({
        title: 'Empty comment',
        description: 'Please enter a comment or add a GIF',
        variant: 'destructive',
      });
      return;
    }
    addCommentMutation.mutate({ content, gif });
  }, [userId, addCommentMutation, toast]);

  const deleteComment = useCallback((commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  }, [deleteCommentMutation]);

  return {
    comments,
    commentsCount,
    isLoading,
    addComment,
    deleteComment,
    isAdding: addCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    userId,
  };
}
