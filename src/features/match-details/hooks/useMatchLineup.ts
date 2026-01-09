import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface LineupPlayer {
  id?: number;
  player_id?: string;
  name: string;
  number: number;
  position: string;
}

export interface TeamLineup {
  teamId: string;
  name: string;
  logo: string;
  formation: string;
  initialLineup: LineupPlayer[][];
  substitutes: LineupPlayer[];
}

export interface LineupData {
  source: 'cache' | 'api';
  matchId: string;
  homeTeam: TeamLineup | null;
  awayTeam: TeamLineup | null;
}

export function useMatchLineup(stgAzuroId: string | undefined) {
  return useQuery({
    queryKey: ['match-lineup', stgAzuroId],
    queryFn: async (): Promise<LineupData | null> => {
      if (!stgAzuroId) return null;
      
      logger.debug('[useMatchLineup] Fetching lineup for:', stgAzuroId);
      
      const { data, error } = await supabase.functions.invoke('fetch-match-lineup', {
        body: { stgAzuroId }
      });
      
      if (error) {
        logger.error('[useMatchLineup] Error:', error);
        throw error;
      }
      
      // No data or error response
      if (!data || data.error) {
        logger.debug('[useMatchLineup] Lineups not available:', data?.reason);
        return null;
      }
      
      logger.debug('[useMatchLineup] Lineup fetched:', { 
        source: data.source, 
        hasHome: !!data.homeTeam, 
        hasAway: !!data.awayTeam 
      });
      
      return data as LineupData;
    },
    enabled: !!stgAzuroId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
