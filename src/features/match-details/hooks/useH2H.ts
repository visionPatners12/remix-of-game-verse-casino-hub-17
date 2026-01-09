import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { H2HData, H2HMatch, H2HSummary } from '../types/h2h';

interface UseH2HOptions {
  homeTeamId?: string;
  awayTeamId?: string;
  limit?: number;
  sport?: string; // 'football' | 'american-football' | 'nba' etc.
  leagueSlug?: string; // For basketball: determines NBA vs generic endpoint
}

interface UseH2HReturn {
  data: H2HData | null;
  isLoading: boolean;
  error: Error | null;
}

interface H2HResponse {
  source: 'cache' | 'api' | 'none';
  summary: H2HSummary | null;
  matches: H2HMatch[];
  warning?: string;
  error?: string;
}

/**
 * Hook to fetch Head-to-Head data between two teams
 * Uses Supabase edge function connected to Highlightly API
 */
export function useH2H({ homeTeamId, awayTeamId, limit = 5, sport = 'football', leagueSlug }: UseH2HOptions): UseH2HReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['h2h', homeTeamId, awayTeamId, limit, sport, leagueSlug],
    queryFn: async (): Promise<H2HData | null> => {
      const { data: response, error: invokeError } = await supabase.functions.invoke<H2HResponse>('fetch-h2h', {
        body: { homeTeamId, awayTeamId, limit, sport, leagueSlug }
      });

      if (invokeError) {
        console.error('[useH2H] Edge function error:', invokeError);
        throw invokeError;
      }

      if (!response || response.error) {
        console.warn('[useH2H] Response error:', response?.error);
        return null;
      }

      if (!response.summary) {
        return {
          summary: { homeWins: 0, draws: 0, awayWins: 0, totalMatches: 0 },
          matches: []
        };
      }

      return {
        summary: response.summary,
        matches: response.matches
      };
    },
    enabled: !!homeTeamId && !!awayTeamId,
    staleTime: 1000 * 60 * 60, // 1 hour client-side cache
    gcTime: 1000 * 60 * 60 * 2, // 2 hours garbage collection
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null
  };
}
