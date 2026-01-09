import { useQuery } from '@tanstack/react-query';

interface TopTeam {
  id: string;
  team_id: number;
  sport_id: number;
  priority_order: number;
  is_featured: boolean;
  name?: string;
  logo_url?: string;
  country_code?: string;
  country_name?: string;
}

/**
 * Temporary mock implementation until top_teams table is created
 */
export function useTopTeams(sportIds?: number[]) {
  const query = useQuery({
    queryKey: ['top-teams', sportIds],
    queryFn: async (): Promise<TopTeam[]> => {
      // Return empty array until table is implemented
      return [];
    },
    enabled: !!(sportIds && sportIds.length > 0),
    staleTime: 5 * 60 * 1000,
  });

  return { 
    teams: query.data || [], 
    loading: query.isLoading, 
    error: query.error?.message || null 
  };
}