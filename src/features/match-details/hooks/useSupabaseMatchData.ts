import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { logger } from '@/utils/logger';

export interface SupabaseMatchData {
  id: string;
  azuro_game_id: string | null;
  match_id: string | null;
  home: string;
  away: string;
  home_team_id: string | null;
  away_team_id: string | null;
  league: string;
  league_id: string | null;
  league_azuro_slug: string | null;
  country_name: string | null;
  start_iso: string;
  state: 'Prematch' | 'Live' | 'Resolved' | 'Cancelled';
  is_live: boolean;
  is_prematch: boolean;
  stage: string | null;
  round: string | null;
  matchStates: any | null;
  statusLong: string | null;
  sport: {
    id: string;
    slug: string;
    name: string;
    icon_name: string;
  } | null;
  league_info: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  } | null;
  home_team: {
    id: string;
    name: string;
    display_name: string | null;
    slug: string;
    logo: string;
  } | null;
  away_team: {
    id: string;
    name: string;
    display_name: string | null;
    slug: string;
    logo: string;
  } | null;
}

export function useSupabaseMatchData(matchId: string) {
  return useQuery({
    queryKey: ['match-supabase', matchId],
    queryFn: async (): Promise<SupabaseMatchData> => {
      logger.debug('Fetching match data from Supabase:', { matchId });

      const { data, error } = await sportsDataClient
        .from('stg_azuro_games')
        .select(`
          id,
          azuro_game_id,
          home,
          away,
          league,
          league_azuro_slug,
          country_name,
          start_iso,
          state,
          is_live,
          is_prematch,
          sport_id,
          league_id,
          home_team_id,
          away_team_id,
          country_id,
          match_id,
          sport:sport_id (
            id,
            name,
            slug,
            icon_name
          ),
          league_info:league_id (
            id,
            name,
            slug,
            logo
          ),
          home_team:home_team_id (
            id,
            name,
            display_name,
            slug,
            logo
          ),
          away_team:away_team_id (
            id,
            name,
            display_name,
            slug,
            logo
          ),
          fixture:match_id (
            status_long
          ),
          match:match_id (
            stage,
            round,
            states
          )
        `)
      .eq('id', matchId)
      .maybeSingle();

      if (error) {
        logger.error('Error fetching match from Supabase:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Match not found');
      }

      const matchData = data as any;
      
      const result: SupabaseMatchData = {
        id: matchData.id,
        azuro_game_id: matchData.azuro_game_id,
        match_id: matchData.match_id,
        home: matchData.home,
        away: matchData.away,
        home_team_id: matchData.home_team_id,
        away_team_id: matchData.away_team_id,
        league: matchData.league,
        league_id: matchData.league_id,
        league_azuro_slug: matchData.league_azuro_slug,
        country_name: matchData.country_name,
        start_iso: matchData.start_iso,
        state: matchData.state,
        is_live: matchData.is_live,
        is_prematch: matchData.is_prematch,
        stage: matchData.match?.stage || null,
        round: matchData.match?.round || null,
        matchStates: matchData.match?.states || null,
        statusLong: matchData.fixture?.status_long || null,
        sport: matchData.sport || null,
        league_info: matchData.league_info || {
          id: '',
          name: matchData.league || '',
          slug: matchData.league_azuro_slug || '',
          logo: ''
        },
        home_team: matchData.home_team || {
          id: '',
          name: matchData.home,
          display_name: null,
          slug: '',
          logo: ''
        },
        away_team: matchData.away_team || {
          id: '',
          name: matchData.away,
          display_name: null,
          slug: '',
          logo: ''
        },
      };

      logger.debug('Match data fetched successfully:', result);
      return result;
    },
    enabled: !!matchId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
