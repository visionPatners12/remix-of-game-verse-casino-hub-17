import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface TopTeam {
  id: string;
  team_id: string;
  sport_id: string;
  rank: number;
  popularity_score: number;
  name?: string;
  logo?: string;
  region?: string;
}

/**
 * Temporary mock implementation until top_teams table is created
 */
export function useOptimizedTopTeams(sportIds?: string[]) {
  const query = useQuery({
    queryKey: ['top-teams', sportIds],
    queryFn: async () => {
      // Return empty array until table is implemented
      return [];
    },
    enabled: Boolean(sportIds && sportIds.length > 0),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return useMemo(() => ({
    teams: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isStale: query.isStale,
    isFetching: query.isFetching,
  }), [query.data, query.isLoading, query.error, query.isStale, query.isFetching]);
}