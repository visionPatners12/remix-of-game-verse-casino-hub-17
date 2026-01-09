import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UseEntityFollowParams {
  entityType: 'league' | 'team' | 'player';
  leagueId?: string;
  teamId?: string;
  playerId?: string;  // UUID
}

interface UserPreference {
  id: string;
  user_id: string;
  entity_type: 'league' | 'team' | 'sport' | 'player';
  league_id: string | null;
  team_id: string | null;
  sport_id: string | null;
  player_id: string | null;  // UUID
  position: number;
  created_at: string;
}

export function useEntityFollow({ entityType, leagueId, teamId, playerId }: UseEntityFollowParams) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if hook is enabled (has required params)
  const isEnabled = (entityType === 'league' && !!leagueId) || 
                    (entityType === 'team' && !!teamId) ||
                    (entityType === 'player' && !!playerId);

  const entityId = entityType === 'league' ? leagueId 
                 : entityType === 'team' ? teamId 
                 : playerId;
  const entityColumn = entityType === 'league' ? 'league_id' 
                     : entityType === 'team' ? 'team_id' 
                     : 'player_id';

  // Check if current user has this entity in favorites (user_preferences)
  const { data: isFollowing = false, isLoading: isFollowingLoading } = useQuery({
    queryKey: ['entity-follow', entityType, entityId, user?.id],
    queryFn: async () => {
      if (!user?.id || !entityId) return false;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .eq(entityColumn, entityId)
        .maybeSingle();

      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    },
    enabled: isEnabled && !!user?.id && !!entityId,
  });

  // Get followers count using RPC function (bypasses RLS to get accurate count)
  const { data: followersCount = 0, isLoading: isCountLoading } = useQuery({
    queryKey: ['entity-followers-count', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return 0;

      const { data, error } = await supabase
        .rpc('get_entity_followers_count', {
          p_entity_type: entityType,
          p_entity_id: entityId,
        });

      if (error) {
        console.error('Error fetching followers count:', error);
        return 0;
      }

      return data || 0;
    },
    enabled: isEnabled && !!entityId,
  });

  // Toggle follow mutation
  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (!isEnabled || !user?.id || !entityId) {
        throw new Error('Cannot toggle follow: missing required parameters');
      }

      if (isFollowing) {
        // Remove from favorites (user_preferences)
        const { error } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', entityType)
          .eq(entityColumn, entityId);

        if (error) throw error;
      } else {
        // Add to favorites (user_preferences)
        // Get current max position for this user
        const { data: existingPrefs } = await supabase
          .from('user_preferences')
          .select('position')
          .eq('user_id', user.id)
          .order('position', { ascending: false })
          .limit(1);

        const nextPosition = existingPrefs && existingPrefs.length > 0 
          ? existingPrefs[0].position + 1 
          : 0;

        const followData = {
          user_id: user.id,
          entity_type: entityType,
          position: nextPosition,
          league_id: entityType === 'league' ? leagueId : null,
          team_id: entityType === 'team' ? teamId : null,
          player_id: entityType === 'player' ? playerId : null,
        };

        const { error } = await supabase
          .from('user_preferences')
          .insert([followData]);

        if (error) throw error;
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['entity-follow', entityType, entityId, user?.id],
      });
      await queryClient.cancelQueries({
        queryKey: ['entity-followers-count', entityType, entityId],
      });

      // Snapshot the previous values
      const previousIsFollowing = queryClient.getQueryData([
        'entity-follow',
        entityType,
        entityId,
        user?.id,
      ]);
      const previousCount = queryClient.getQueryData([
        'entity-followers-count',
        entityType,
        entityId,
      ]);

      // Optimistically update
      queryClient.setQueryData(
        ['entity-follow', entityType, entityId, user?.id],
        !isFollowing
      );
      queryClient.setQueryData(
        ['entity-followers-count', entityType, entityId],
        (old: number = 0) => (isFollowing ? Math.max(0, old - 1) : old + 1)
      );

      return { previousIsFollowing, previousCount };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData(
          ['entity-follow', entityType, entityId, user?.id],
          context.previousIsFollowing
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          ['entity-followers-count', entityType, entityId],
          context.previousCount
        );
      }

      console.error('Error toggling follow:', error);
      toast.error(
        isFollowing
          ? `Failed to unfollow ${entityType}`
          : `Failed to follow ${entityType}`
      );
    },
    onSuccess: () => {
      toast.success(
        isFollowing
          ? `Successfully unfollowed ${entityType}`
          : `Successfully followed ${entityType}`
      );
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['entity-follow', entityType, entityId, user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['entity-followers-count', entityType, entityId],
      });
    },
  });

  return {
    isFollowing,
    followersCount,
    isLoading: !isEnabled || isFollowingLoading || isCountLoading,
    toggleFollow: toggleFollowMutation.mutate,
    isToggling: toggleFollowMutation.isPending,
  };
}
