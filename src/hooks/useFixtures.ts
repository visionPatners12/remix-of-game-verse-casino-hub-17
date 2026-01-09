import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MatchData } from '@/features/sports/types';

interface UseFixturesProps {
  leagueId: string;
}

// Map fixture status to normalized format
function mapFixtureStatus(statusShort: string | null) {
  const statusMapping: Record<string, { state: string; status: string; isLive: boolean; isFinished: boolean }> = {
    // Scheduled
    'NS': { state: 'NS', status: 'upcoming', isLive: false, isFinished: false },
    'TBD': { state: 'TBD', status: 'upcoming', isLive: false, isFinished: false },
    
    // InPlay 
    '1H': { state: '1H', status: 'inplay', isLive: true, isFinished: false },
    '2H': { state: '2H', status: 'inplay', isLive: true, isFinished: false },
    'HT': { state: 'HT', status: 'inplay', isLive: true, isFinished: false },
    'LIVE': { state: 'LIVE', status: 'inplay', isLive: true, isFinished: false },
    'Q1': { state: 'Q1', status: 'inplay', isLive: true, isFinished: false },
    'Q2': { state: 'Q2', status: 'inplay', isLive: true, isFinished: false },
    'Q3': { state: 'Q3', status: 'inplay', isLive: true, isFinished: false },
    'Q4': { state: 'Q4', status: 'inplay', isLive: true, isFinished: false },
    'OT': { state: 'OT', status: 'inplay', isLive: true, isFinished: false },
    'ET': { state: 'ET', status: 'inplay', isLive: true, isFinished: false },
    
    // Finished
    'FT': { state: 'FT', status: 'finished', isLive: false, isFinished: true },
    'AOT': { state: 'AOT', status: 'finished', isLive: false, isFinished: true },
    'AET': { state: 'AET', status: 'finished', isLive: false, isFinished: true },
    'PEN': { state: 'PEN', status: 'finished', isLive: false, isFinished: true },
    
    // Cancelled/Postponed/Abandoned
    'CANC': { state: 'CANC', status: 'cancelled', isLive: false, isFinished: false },
    'POST': { state: 'POST', status: 'postponed', isLive: false, isFinished: false },
    'PST': { state: 'PST', status: 'postponed', isLive: false, isFinished: false },
    'ABD': { state: 'ABD', status: 'abandoned', isLive: false, isFinished: false },
  };
  
  return statusMapping[statusShort || 'NS'] || { state: statusShort || 'NS', status: 'unknown', isLive: false, isFinished: false };
}

export function useFixtures({ leagueId }: UseFixturesProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['fixtures', leagueId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('fixture')
        .select(`
          *,
          home_team:teams!fixture_home_team_id_fkey(id, name, logo),
          away_team:teams!fixture_away_team_id_fkey(id, name, logo),
          league:leagues(id, name, slug, logo),
          sport:sports(id, name, slug, azuro_id)
        `)
        .eq('league_id', leagueId)
        .order('starts_at', { ascending: true });

      if (error) throw error;
      
      // Transform fixtures to MatchData format
      return (data || []).map((fixture: any): MatchData => {
        const statusInfo = mapFixtureStatus(fixture.status_short);
        
        return {
          id: fixture.id,
          gameId: fixture.azuro_game_id || fixture.id,
          startsAt: fixture.starts_at,
          state: statusInfo.state,
          status: statusInfo.status,
          isLive: statusInfo.isLive,
          isFinished: statusInfo.isFinished,
          participants: [
            { 
              name: fixture.home_team?.name || 'Home Team',
              id: fixture.home_team?.id,
              image: fixture.home_team?.logo
            },
            { 
              name: fixture.away_team?.name || 'Away Team',
              id: fixture.away_team?.id,
              image: fixture.away_team?.logo
            }
          ],
          league: fixture.league ? {
            id: fixture.league.id,
            name: fixture.league.name,
            slug: fixture.league.slug,
            image_path: fixture.league.logo
          } : undefined,
          sport: fixture.sport ? {
            sportId: fixture.sport.id,
            slug: fixture.sport.slug,
            name: fixture.sport.name
          } : undefined,
          scores: fixture.score ? {
            home: fixture.score?.home?.total || fixture.score?.home || 0,
            away: fixture.score?.away?.total || fixture.score?.away || 0,
          } : undefined,
          payload: fixture.payload,
        };
      });
    },
    staleTime: 30_000,
    gcTime: 300_000,
  });

  return {
    fixtures: data || [],
    loading: isLoading,
    error,
  };
}
