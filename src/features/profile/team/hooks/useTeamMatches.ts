import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import type { MatchData } from '@/features/sports/types';

function getMatchState(statusShort: string | null): string {
  const status = statusShort?.toUpperCase();
  
  const liveStatuses = ['Q1', 'Q2', 'Q3', 'Q4', 'HT', 'BT', 'P', 'OT', 'LIVE', 'INPLAY'];
  const finishedStatuses = ['FT', 'AET', 'AP', 'AOT', 'FT_PEN', 'BREAK'];
  
  if (status && liveStatuses.includes(status)) return 'inprogress';
  if (status && finishedStatuses.includes(status)) return 'finished';
  return 'upcoming';
}

export function useTeamMatches(teamId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['team-matches', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data: matches, error } = await sportsDataClient
        .from('match')
        .select(`
          *,
          league:league_id(id, name, slug, logo, azuro_slug),
          home_team:home_team_id(id, name, logo, slug),
          away_team:away_team_id(id, name, logo, slug),
          sport:sport_id(id, name, slug),
          azuro_data:azuro_stg_id(azuro_game_id)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('starts_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformedMatches: MatchData[] = (matches || []).map((match: any) => {
        // Fallback sur raw si les équipes sont manquantes
        let homeTeam = match.home_team;
        let awayTeam = match.away_team;

        if (!homeTeam && match.raw?.teams?.home) {
          homeTeam = {
            id: match.home_team_id || '',
            name: match.raw.teams.home.name || 'Unknown',
            logo: match.raw.teams.home.logo || '',
            slug: match.raw.teams.home.slug || '',
          };
        }

        if (!awayTeam && match.raw?.teams?.away) {
          awayTeam = {
            id: match.away_team_id || '',
            name: match.raw.teams.away.name || 'Unknown',
            logo: match.raw.teams.away.logo || '',
            slug: match.raw.teams.away.slug || '',
          };
        }

        const matchState = getMatchState(match.status_short);

        return {
          id: match.id,
          gameId: match.azuro_data?.azuro_game_id || match.id,
          startsAt: match.starts_at,
          state: matchState,
          status: match.status_short || 'NS',
          sport: match.sport ? {
            sportId: match.sport.id,
            slug: match.sport.slug,
            name: match.sport.name,
          } : undefined,
          league: match.league ? {
            id: match.league.id,
            slug: match.league.slug,
            name: match.league.name,
            azuro_slug: match.league.azuro_slug,
            image_path: match.league.logo,
          } : undefined,
          home_team: homeTeam || { id: '', name: 'Unknown', logo: '' },
          away_team: awayTeam || { id: '', name: 'Unknown', logo: '' },
          scores: match.score || match.raw?.score,
          participants: [
            { name: homeTeam?.name || 'Unknown', image: homeTeam?.logo },
            { name: awayTeam?.name || 'Unknown', image: awayTeam?.logo }
          ],
        };
      });

      return transformedMatches;
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000,
  });

  const finalMatches = data || [];
  const upcoming = finalMatches.filter(m => m.state === 'upcoming');
  const past = finalMatches.filter(m => m.state !== 'upcoming');

  return {
    upcomingMatches: upcoming,
    pastMatches: past,
    loading: isLoading,
    error,
  };
}
