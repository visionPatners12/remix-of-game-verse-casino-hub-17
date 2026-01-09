import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

export const useFavoriteSports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to get user's favorite sport IDs
  const { data: favoriteSports = [], isLoading } = useQuery({
    queryKey: ['favorite-sports', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('sport_id')
        .eq('user_id', user.id)
        .not('sport_id', 'is', null);
      
      if (error) throw error;
      
      return data.map(item => item.sport_id).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  // Mutation to add a favorite sport (simplified - trigger handles position/entity_type)
  const addFavoriteMutation = useMutation({
    mutationFn: async (sportId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          sport_id: sportId,
          position: null as any // Will be auto-assigned by trigger
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sports', user?.id] });
    },
  });

  // Mutation to remove a favorite sport
  const removeFavoriteMutation = useMutation({
    mutationFn: async (sportId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('sport_id', sportId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-sports', user?.id] });
    },
  });

  const addFavorite = async (sportId: string) => {
    await addFavoriteMutation.mutateAsync(sportId);
  };

  const removeFavorite = async (sportId: string) => {
    await removeFavoriteMutation.mutateAsync(sportId);
  };

  return {
    favoriteSports,
    isLoading,
    addFavorite,
    removeFavorite,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  };
};