import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

interface EnrichedSelectionData {
  id: string | null;
  sport: { name: string; slug: string; icon_name?: string } | null;
  league: { name: string; slug: string; logo?: string } | null;
  participants: { name: string; image: string | null }[];
  startsAt: string | null;
  eventName: string;
}

export function useSelectionEnrichment(gameId: string | undefined) {
  return useQuery({
    queryKey: ['selection-enrichment', gameId],
    queryFn: async (): Promise<EnrichedSelectionData | null> => {
      if (!gameId) return null;
      
      const { data, error } = await sportsDataClient
        .from('stg_azuro_games')
        .select(`
          id,
          home,
          away,
          league,
          league_azuro_slug,
          start_iso,
          payload,
          sport:sport_id (name, slug, icon_name),
          league_info:league_id (name, slug, logo),
          home_team:home_team_id (name, logo),
          away_team:away_team_id (name, logo)
        `)
        .eq('azuro_game_id', gameId)
        .maybeSingle();
      
      if (error || !data) return null;
      
      const payload = data.payload as any || {};
      
      // FK joins return arrays, so we need to access the first element
      const sport = Array.isArray(data.sport) ? data.sport[0] : data.sport;
      const leagueInfo = Array.isArray(data.league_info) ? data.league_info[0] : data.league_info;
      const homeTeam = Array.isArray(data.home_team) ? data.home_team[0] : data.home_team;
      const awayTeam = Array.isArray(data.away_team) ? data.away_team[0] : data.away_team;
      
      return {
        id: data.id || null,
        sport: sport || (payload.sport ? { name: payload.sport.name, slug: payload.sport.slug, icon_name: payload.sport.icon_name } : null),
        league: leagueInfo || { 
          name: data.league, 
          slug: data.league_azuro_slug || '',
          logo: payload.league?.logo || undefined
        },
        participants: [
          { 
            name: homeTeam?.name || data.home, 
            image: homeTeam?.logo || payload.participants?.[0]?.image || null 
          },
          { 
            name: awayTeam?.name || data.away, 
            image: awayTeam?.logo || payload.participants?.[1]?.image || null 
          }
        ],
        startsAt: data.start_iso,
        eventName: `${data.home} vs ${data.away}`
      };
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,
  });
}
