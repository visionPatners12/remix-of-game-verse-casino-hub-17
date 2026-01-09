import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

interface TeamStanding {
  id: string;
  season: number;
  rank: number;
  games_played?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  win_pct?: number;
  goals_for?: number;
  goals_against?: number;
  goal_diff?: number;
  points?: number;
  form?: string;
  description?: string;
  league?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  sport?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function useTeamStandings(teamId: string | undefined) {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ['team-standings', teamId],
    queryFn: async (): Promise<TeamStanding[]> => {
      if (!teamId) return [];

      const { data, error } = await sportsDataClient
        .from('standings')
        .select(`
          *,
          league:league_id(id, name, slug, logo),
          sport:sport_id(id, name, slug)
        `)
        .eq('team_id', teamId)
        .order('season', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    standings: standings || [],
    loading: isLoading,
    error,
  };
}
