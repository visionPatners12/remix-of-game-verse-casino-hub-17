import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { GetHighlightsResponse } from '../types/rpc';

interface UseInfiniteHighlightsOptions {
  sportId?: string;
  leagueId?: string;
  teamId?: string;
  pageSize?: number;
}

export function useInfiniteHighlights(options: UseInfiniteHighlightsOptions = {}) {
  const { user } = useAuth();
  const { sportId, leagueId, teamId, pageSize = 20 } = options;

  return useInfiniteQuery({
    queryKey: ['highlights', 'infinite', user?.id, sportId, leagueId, teamId],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('get_highlights', {
        p_user_id: user?.id ?? null,
        p_limit: pageSize,
        p_cursor: (pageParam as string | undefined) ?? null,
        p_sport_id: sportId ?? null,
        p_league_id: leagueId ?? null,
        p_team_id: teamId ?? null,
      });

      if (error) throw error;

      // RPC returns array matching GetHighlightsResponse structure
      const highlights = (data ?? []) as GetHighlightsResponse[];

      return {
        highlights,
        nextCursor: highlights.length === pageSize 
          ? highlights[highlights.length - 1].match_date 
          : undefined,
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });
}
