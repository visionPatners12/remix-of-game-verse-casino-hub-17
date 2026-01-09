import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { ProfileData } from '@/features/profile/types';
import { cacheConfigs } from '@/lib/queryClient';
import { logger } from '@/utils/logger';

/**
 * Unified user profile hook - replaces duplicate profile hooks
 * Uses TanStack Query with proper caching and deduplication
 */
export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query for user profile data
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!user?.id) return null;
      
      logger.debug('useUserProfile: Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('useUserProfile: Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: isAuthenticated && !!user?.id,
    ...cacheConfigs.user,
  });

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ProfileData>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      logger.debug('useUserProfile: Updating profile:', updates);
      
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      logger.debug('useUserProfile: Profile updated successfully');
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}