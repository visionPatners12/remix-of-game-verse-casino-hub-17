import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

interface FavoriteLeagueData {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
  country: string | null;
  sport: {
    id: string;
    name: string;
    icon_name: string;
  } | null;
}

export const useFavoriteLeagues = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to get user's favorite league IDs
  const { data: favoriteLeagues = [], isLoading } = useQuery({
    queryKey: ['favorite-leagues', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('league_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'league')
        .not('league_id', 'is', null)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => item.league_id).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  // Query to get complete favorite league data (optimized single query)
  const { data: favoriteLeaguesData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ['favorite-leagues-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get league IDs from public.user_preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('league_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'league')
        .not('league_id', 'is', null)
        .order('position', { ascending: true });
      
      if (prefsError) throw prefsError;
      
      const leagueIds = prefsData?.map(p => p.league_id).filter(Boolean) || [];
      if (leagueIds.length === 0) return [];
      
      // Get league details from sports_data.league
      const { data: leaguesData, error: leaguesError } = await sportsDataClient
        .from('league')
        .select(`
          id,
          name,
          logo,
          slug,
          country:country_id(name),
          sport:sport_id(id, name, icon_name)
        `)
        .in('id', leagueIds);
      
      if (leaguesError) throw leaguesError;
      
      return (leaguesData || []).map((league: any) => ({
        id: league.id,
        name: league.name,
        logo: league.logo,
        slug: league.slug,
        country: league.country?.name || null,
        sport: league.sport ? {
          id: league.sport.id,
          name: league.sport.name,
          icon_name: league.sport.icon_name
        } : null,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 min cache
  });

  // Mutation to add a favorite league
  const addFavoriteMutation = useMutation({
    mutationFn: async (leagueId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Validate league exists in sports_data.league
      const { error: validationError } = await sportsDataClient
        .from('league')
        .select('id')
        .eq('id', leagueId)
        .single();
      
      if (validationError) throw new Error('Invalid league ID');
      
      // Get the next position for this user's leagues
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('position')
        .eq('user_id', user.id)
        .eq('entity_type', 'league')
        .order('position', { ascending: false })
        .limit(1);
      
      const nextPosition = existingPrefs?.[0]?.position ? existingPrefs[0].position + 1 : 1;
      
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          league_id: leagueId,
          entity_type: 'league',
          position: nextPosition
        });
      
      if (error) throw error;
    },
    onMutate: async (leagueId) => {
      // Cancel outgoing refetches for optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorite-leagues', user?.id] });
      
      // Snapshot previous value
      const previousLeagues = queryClient.getQueryData<string[]>(['favorite-leagues', user?.id]);
      
      // Optimistically update cache
      queryClient.setQueryData<string[]>(['favorite-leagues', user?.id], (old = []) => {
        return [...old, leagueId];
      });
      
      return { previousLeagues };
    },
    onError: (_err, _leagueId, context) => {
      // Rollback on error
      if (context?.previousLeagues) {
        queryClient.setQueryData(['favorite-leagues', user?.id], context.previousLeagues);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-leagues', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-leagues-data', user?.id] });
    },
  });

  // Mutation to remove a favorite league
  const removeFavoriteMutation = useMutation({
    mutationFn: async (leagueId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('league_id', leagueId)
        .eq('entity_type', 'league');
      
      if (error) throw error;
    },
    onMutate: async (leagueId) => {
      // Cancel outgoing refetches for optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorite-leagues', user?.id] });
      
      // Snapshot previous value
      const previousLeagues = queryClient.getQueryData<string[]>(['favorite-leagues', user?.id]);
      
      // Optimistically update cache
      queryClient.setQueryData<string[]>(['favorite-leagues', user?.id], (old = []) => {
        return old.filter(id => id !== leagueId);
      });
      
      return { previousLeagues };
    },
    onError: (_err, _leagueId, context) => {
      // Rollback on error
      if (context?.previousLeagues) {
        queryClient.setQueryData(['favorite-leagues', user?.id], context.previousLeagues);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-leagues', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-leagues-data', user?.id] });
    },
  });

  const addFavorite = async (leagueId: string) => {
    await addFavoriteMutation.mutateAsync(leagueId);
  };

  const removeFavorite = async (leagueId: string) => {
    await removeFavoriteMutation.mutateAsync(leagueId);
  };

  return {
    favoriteLeagues,
    favoriteLeaguesData,
    isLoading: isLoading || isLoadingData,
    addFavorite,
    removeFavorite,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  };
};