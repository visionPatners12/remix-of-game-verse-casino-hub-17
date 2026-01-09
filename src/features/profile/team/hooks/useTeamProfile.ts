import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

interface TeamProfile {
  id: string;
  name: string;
  logo?: string;
  slug?: string;
  abbreviation?: string;
  sport?: {
    id: string;
    name: string;
    slug: string;
    icon_name?: string;
  };
  country?: {
    id: string;
    name: string;
    code?: string;
    logo?: string;
  };
}

export function useTeamProfile(teamId: string | undefined) {
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team-profile', teamId],
    queryFn: async (): Promise<TeamProfile | null> => {
      if (!teamId) return null;

      const { data, error } = await sportsDataClient
        .from('teams')
        .select(`
          *,
          sport:sport_id(id, name, slug, icon_name),
          country:country_id(id, name, code, logo)
        `)
        .eq('id', teamId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    team,
    loading: isLoading,
    error,
  };
}
