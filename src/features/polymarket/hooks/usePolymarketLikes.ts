import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { polymarketClient } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface LikeStatus {
  likesCount: number;
  isLiked: boolean;
}

// Query key factory - include userId to differentiate caches per user
const LIKES_KEYS = {
  status: (eventId: string, userId: string | null) => ['polymarket', 'likes', eventId, userId] as const,
  userLikes: (userId: string) => ['polymarket', 'user-likes', userId] as const,
};

export function usePolymarketLikes(eventId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use useAuth instead of manual auth state management
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Fetch like status for event
  const { data: likeStatus, isLoading } = useQuery({
    // Include userId in queryKey to auto-refetch when userId changes
    queryKey: LIKES_KEYS.status(eventId || '', userId),
    queryFn: async (): Promise<LikeStatus> => {
      if (!eventId) return { likesCount: 0, isLiked: false };

      // Always count likes (for all users, even anonymous)
      const { count: likesCount } = await polymarketClient
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      // Check if logged-in user has liked
      let isLiked = false;
      if (userId) {
        const { data: likeData } = await polymarketClient
          .from('likes')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle();
        isLiked = !!likeData;
      }

      return {
        likesCount: likesCount ?? 0,
        isLiked,
      };
    },
    enabled: !!eventId,
    staleTime: 30000,
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!eventId || !userId) {
        throw new Error('Must be logged in to like');
      }

      const isCurrentlyLiked = likeStatus?.isLiked ?? false;

      if (isCurrentlyLiked) {
        const { error } = await polymarketClient
          .from('likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await polymarketClient
          .from('likes')
          .insert({ event_id: eventId, user_id: userId });
        if (error) throw error;
      }

      return !isCurrentlyLiked;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: LIKES_KEYS.status(eventId || '', userId) });

      const previousStatus = queryClient.getQueryData<LikeStatus>(LIKES_KEYS.status(eventId || '', userId));

      queryClient.setQueryData<LikeStatus>(LIKES_KEYS.status(eventId || '', userId), (old) => ({
        likesCount: (old?.likesCount ?? 0) + (old?.isLiked ? -1 : 1),
        isLiked: !old?.isLiked,
      }));

      return { previousStatus };
    },
    onError: (err, _, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(LIKES_KEYS.status(eventId || '', userId), context.previousStatus);
      }
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update like',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIKES_KEYS.status(eventId || '', userId) });
      queryClient.invalidateQueries({ queryKey: ['polymarket', 'event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['polymarket', 'events'] });
    },
  });

  const toggleLike = useCallback(() => {
    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please login to like events',
        variant: 'destructive',
      });
      return;
    }
    toggleLikeMutation.mutate();
  }, [userId, toggleLikeMutation, toast]);

  return {
    likesCount: likeStatus?.likesCount ?? 0,
    isLiked: likeStatus?.isLiked ?? false,
    isLoading,
    toggleLike,
    isToggling: toggleLikeMutation.isPending,
  };
}
