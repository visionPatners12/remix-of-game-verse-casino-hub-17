import { useQuery } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import type { Highlight } from '../types';

export function useHighlights(limit: number = 12) {
  return useQuery({
    queryKey: ['highlights', limit],
    queryFn: async () => {
      const { data, error } = await sportsDataClient
        .from('highlights')
        .select(`
          *,
          league:league_id(id, name, logo, slug),
          home_team:home_team_id(id, name, logo, abbreviation),
          away_team:away_team_id(id, name, logo, abbreviation)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Highlight[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHighlightsByFixture(fixtureId: string) {
  return useQuery({
    queryKey: ['highlights', 'fixture', fixtureId],
    queryFn: async () => {
      const { data, error } = await sportsDataClient
        .from('highlights')
        .select(`
          *,
          league:league_id(id, name, logo, slug),
          home_team:home_team_id(id, name, logo, abbreviation),
          away_team:away_team_id(id, name, logo, abbreviation)
        `)
        .eq('match_highlightly_id', fixtureId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Highlight[];
    },
    enabled: !!fixtureId,
  });
}
