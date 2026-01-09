import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

interface FavoriteTeamData {
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

export const useFavoriteTeams = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to get user's favorite team IDs
  const { data: favoriteTeams = [], isLoading } = useQuery({
    queryKey: ['favorite-teams', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'team')
        .not('team_id', 'is', null)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => item.team_id).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  // Query to get complete favorite team data (2-step: public.user_preferences → sports_data.teams)
  const { data: favoriteTeamsData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ['favorite-teams-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Step 1: Get team IDs from public.user_preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'team')
        .not('team_id', 'is', null)
        .order('position', { ascending: true });
      
      if (prefsError) throw prefsError;
      
      const teamIds = prefsData?.map(p => p.team_id).filter(Boolean) || [];
      if (teamIds.length === 0) return [];
      
      // Step 2: Get team details from sports_data.teams
      const { data: teamsData, error: teamsError } = await sportsDataClient
        .from('teams')
        .select(`
          id,
          name,
          logo,
          slug,
          country:country_id(name),
          sport:sport_id(id, name, icon_name)
        `)
        .in('id', teamIds);
      
      if (teamsError) throw teamsError;
      
      return (teamsData || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        logo: team.logo,
        slug: team.slug,
        country: team.country?.name || null,
        sport: team.sport ? {
          id: team.sport.id,
          name: team.sport.name,
          icon_name: team.sport.icon_name
        } : null,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // Cache 2 minutes
  });

  // Mutation to add a favorite team
  const addFavoriteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Client-side validation: verify team exists
      const { data: teamExists, error: validationError } = await sportsDataClient
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .single();
      
      if (validationError || !teamExists) {
        throw new Error('Invalid team ID');
      }
      
      // Get the next position for this user's teams
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('position')
        .eq('user_id', user.id)
        .eq('entity_type', 'team')
        .order('position', { ascending: false })
        .limit(1);
      
      const nextPosition = existingPrefs?.[0]?.position ? existingPrefs[0].position + 1 : 1;
      
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          team_id: teamId,
          entity_type: 'team',
          position: nextPosition
        });
      
      if (error) throw error;
    },
    onMutate: async (teamId) => {
      await queryClient.cancelQueries({ queryKey: ['favorite-teams', user?.id] });
      
      const previousTeams = queryClient.getQueryData(['favorite-teams', user?.id]);
      
      queryClient.setQueryData(['favorite-teams', user?.id], (old: any) => {
        return old ? [...old, teamId] : [teamId];
      });
      
      return { previousTeams };
    },
    onError: (err, teamId, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(['favorite-teams', user?.id], context.previousTeams);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-teams', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-teams-data', user?.id] });
    },
  });

  // Mutation to remove a favorite team
  const removeFavoriteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .eq('entity_type', 'team');
      
      if (error) throw error;
    },
    onMutate: async (teamId) => {
      await queryClient.cancelQueries({ queryKey: ['favorite-teams', user?.id] });
      
      const previousTeams = queryClient.getQueryData(['favorite-teams', user?.id]);
      
      queryClient.setQueryData(['favorite-teams', user?.id], (old: any) => {
        return old ? (old as string[]).filter(id => id !== teamId) : [];
      });
      
      return { previousTeams };
    },
    onError: (err, teamId, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(['favorite-teams', user?.id], context.previousTeams);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-teams', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-teams-data', user?.id] });
    },
  });

  const addFavorite = async (teamId: string) => {
    await addFavoriteMutation.mutateAsync(teamId);
  };

  const removeFavorite = async (teamId: string) => {
    await removeFavoriteMutation.mutateAsync(teamId);
  };

  return {
    favoriteTeams,
    favoriteTeamsData,
    isLoading: isLoading || isLoadingData,
    addFavorite,
    removeFavorite,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  };
};