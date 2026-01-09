import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { useAuth } from '@/hooks/useAuth';
import type { GetHighlightsResponse } from '../types/rpc';

interface UseFilteredHighlightsOptions {
  pageSize?: number;
}

/**
 * Fetches highlights filtered by user preferences (leagues & teams)
 * Uses direct Supabase query instead of RPC for simplicity
 */
export function useFilteredHighlights(options: UseFilteredHighlightsOptions = {}) {
  const { user } = useAuth();
  const { pageSize = 20 } = options;

  // Cache user preferences separately
  const { data: userPrefs } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return { leagueIds: [], teamIds: [] };
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('league_id, team_id, entity_type')
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        leagueIds: data?.filter(p => p.league_id).map(p => p.league_id!) || [],
        teamIds: data?.filter(p => p.team_id).map(p => p.team_id!) || [],
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  return useInfiniteQuery({
    queryKey: ['highlights', 'filtered', user?.id, userPrefs?.leagueIds, userPrefs?.teamIds],
    queryFn: async ({ pageParam }) => {
      let query = sportsDataClient
        .from('highlights')
        .select(`
          id,
          highlightly_id,
          sport_id,
          match_highlightly_id,
          match_date,
          title,
          description,
          type,
          video_url,
          embed_url,
          image_url,
          duration_seconds,
          source,
          channel,
          thumbnails,
          created_at,
          updated_at,
          league_id,
          home_team_id,
          away_team_id,
          match_id,
          league:league_id(id, name, logo, slug),
          home_team:home_team_id(id, name, logo, abbreviation),
          away_team:away_team_id(id, name, logo, abbreviation),
          match:match_id(id, status, stage, round, states)
        `)
        .order('match_date', { ascending: false, nullsFirst: false })
        .limit(pageSize);

      // Filter by user preferences if available
      const leagueIds = userPrefs?.leagueIds || [];
      const teamIds = userPrefs?.teamIds || [];

      if (leagueIds.length > 0 || teamIds.length > 0) {
        const filters: string[] = [];
        
        if (leagueIds.length > 0) {
          filters.push(`league_id.in.(${leagueIds.join(',')})`);
        }
        if (teamIds.length > 0) {
          filters.push(`home_team_id.in.(${teamIds.join(',')})`);
          filters.push(`away_team_id.in.(${teamIds.join(',')})`);
        }
        
        query = query.or(filters.join(','));
      }

      // Cursor-based pagination
      if (pageParam) {
        query = query.lt('match_date', pageParam);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to match GetHighlightsResponse structure
      const highlights: GetHighlightsResponse[] = (data || []).map(h => {
        // Relations return arrays, extract first element
        const league = Array.isArray(h.league) ? h.league[0] : h.league;
        const home_team = Array.isArray(h.home_team) ? h.home_team[0] : h.home_team;
        const away_team = Array.isArray(h.away_team) ? h.away_team[0] : h.away_team;
        const match = Array.isArray(h.match) ? h.match[0] : h.match;
        
        return {
          ...h,
          league,
          home_team,
          away_team,
          match,
          relevance_score: 1,
          match_reason: 'user_preference',
        };
      });

      return {
        highlights,
        nextCursor: highlights.length === pageSize 
          ? highlights[highlights.length - 1].match_date 
          : undefined,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: userPrefs !== undefined, // Wait for preferences
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}
