import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import type { NormalizedGameState } from '@/features/sports/types/supabase';

interface UseSupabaseGamesOptions {
  sportSlug?: string;
  leagueSlug?: string;
  countryName?: string; // Filter by country when league slug is provided
  leagueId?: string;
  teamId?: string;
  limit?: number;
  orderBy?: 'turnover' | 'start_iso';
  orderDirection?: 'asc' | 'desc';
  staleTime?: number;
  isLive?: boolean;
  timeFilter?: 'upcoming' | 'past' | 'all';
}

/**
 * Hook to fetch games from stg_azuro_games Supabase table
 * Uses direct columns and FK joins - NO payload JSONB
 */
export const useSupabaseGames = (options: UseSupabaseGamesOptions = {}) => {
  const {
    sportSlug,
    leagueSlug,
    countryName,
    leagueId,
    teamId,
    limit = 50,
    orderBy = 'start_iso',
    orderDirection = 'asc',
    staleTime = 30_000,
    isLive = false,
    timeFilter,
  } = options;

  return useQuery({
    queryKey: ['supabase-games', sportSlug, leagueSlug, countryName, leagueId, teamId, limit, orderBy, orderDirection, isLive, timeFilter],
    queryFn: async () => {
      // Get sport_id if sportSlug is provided
      let sportId: string | null = null;
      if (sportSlug) {
        const { data: sportData } = await sportsDataClient
          .from('sport')
          .select('id')
          .eq('slug', sportSlug)
          .single();
        sportId = sportData?.id || null;
      }

      // Build query with direct columns and FK joins - payload only for fallback images
      let query = sportsDataClient
        .from('stg_azuro_games')
        .select(`
          id,
          azuro_game_id,
          sport_id,
          league_id,
          match_id,
          home_team_id,
          away_team_id,
          slug,
          title,
          turnover,
          home,
          away,
          league,
          league_azuro_slug,
          country_name,
          start_iso,
          state,
          is_prematch,
          is_live,
          payload,
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
          sport:sport_id (
            id,
            slug,
            name,
            azuro_id,
            icon_name
          ),
          match:match_id (
            id,
            states,
            stage,
            round,
            week
          ),
          league_fk:league_id (
            id,
            name,
            slug,
            logo
          )
        `);

      // Filter by live/prematch status (only when not using timeFilter)
      if (!timeFilter) {
        if (isLive) {
          query = query.eq('is_live', true);
        } else {
          query = query.eq('is_prematch', true);
        }
      }

      // Filter by time (upcoming = is_prematch, past = not prematch and not live)
      if (timeFilter === 'upcoming') {
        query = query.eq('is_prematch', true);
      } else if (timeFilter === 'past') {
        query = query.eq('is_prematch', false).eq('is_live', false);
      }

      // Filter by sport_id (server-side)
      if (sportId) {
        query = query.eq('sport_id', sportId);
      }

      // Filter by league_id (UUID) - preferred for performance
      if (leagueId) {
        query = query.eq('league_id', leagueId);
      } else if (leagueSlug) {
        // Fallback to slug if no UUID available
        query = query.eq('league_azuro_slug', leagueSlug);
        // Also filter by country to differentiate same league name across countries
        if (countryName) {
          query = query.eq('country_name', countryName);
        }
      }

      // Filter by team (home OR away)
      if (teamId) {
        query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
      }

      // Apply ordering - use direct column for turnover
      let orderedQuery = query;
      if (orderBy === 'turnover') {
        orderedQuery = query.order('turnover', { ascending: false, nullsFirst: false });
      } else {
        orderedQuery = query.order('start_iso', { ascending: orderDirection === 'asc' });
      }

      // Apply limit
      orderedQuery = orderedQuery.limit(limit);

      const { data, error } = await orderedQuery;

      if (error) {
        console.error('Error fetching games from Supabase:', error);
        throw error;
      }

      const filteredData = data || [];

      // State mapping: database stores lowercase, SDK expects capitalized
      const stateMapping: Record<string, NormalizedGameState> = {
        'live': 'Live',
        'prematch': 'Prematch',
        'finished': 'Finished',
        'resolved': 'Resolved',
        'canceled': 'Canceled',
      };

      // Transform to match Azuro SDK format using direct columns and FK joins
      const games = filteredData.map((row) => {
        const normalizedState = stateMapping[(row.state as string)?.toLowerCase() || ''] || 'Prematch';
        
        // Payload participants for fallback images only
        const payloadParticipants = (row.payload as { participants?: Array<{ name?: string; image?: string }> })?.participants || [];
        
        // FK joins return arrays in Supabase, get first element
        const homeTeam = Array.isArray(row.home_team) ? row.home_team[0] : row.home_team;
        const awayTeam = Array.isArray(row.away_team) ? row.away_team[0] : row.away_team;
        const sport = Array.isArray(row.sport) ? row.sport[0] : row.sport;
        const leagueFk = Array.isArray(row.league_fk) ? row.league_fk[0] : row.league_fk;
        const match = Array.isArray(row.match) ? row.match[0] : row.match;
        
        // Build participants from FK joins, fallback to direct columns + payload images
        const participants = [];
        
        // Home team: prefer FK logo, fallback to payload image; use raw home_team_id as fallback for teamId
        const homeTeamLogo = homeTeam?.logo || payloadParticipants[0]?.image || null;
        participants.push({
          name: homeTeam?.display_name || homeTeam?.name || row.home || payloadParticipants[0]?.name || '',
          image: homeTeamLogo,
          teamId: homeTeam?.id || row.home_team_id || null,
        });
        
        // Away team: prefer FK logo, fallback to payload image; use raw away_team_id as fallback for teamId
        const awayTeamLogo = awayTeam?.logo || payloadParticipants[1]?.image || null;
        participants.push({
          name: awayTeam?.display_name || awayTeam?.name || row.away || payloadParticipants[1]?.name || '',
          image: awayTeamLogo,
          teamId: awayTeam?.id || row.away_team_id || null,
        });
        
        return {
          id: row.id,                              // UUID Supabase (navigation)
          gameId: row.azuro_game_id || '',         // Azuro ID (markets)
          slug: row.slug || '',
          title: row.title || '',
          startsAt: Math.floor(new Date(row.start_iso || Date.now()).getTime() / 1000).toString(),
          state: normalizedState,
          is_live: row.is_live ?? false,           // Boolean flag for live status
          is_prematch: row.is_prematch ?? false,   // Boolean flag for prematch status
          sport: {
            sportId: sport?.azuro_id?.toString() || '',  // Azuro sportId from FK
            name: sport?.name || '',
            slug: sport?.slug || '',
            icon_name: sport?.icon_name || null,         // Icon name for sport icon
          },
          league: {
            id: row.league_id || '',
            name: row.league || '',
            slug: row.league_azuro_slug || '',
            logo: leagueFk?.logo || null,               // League logo from FK
          },
          country: {
            name: row.country_name || '',
            slug: '',
          },
          participants,
          turnover: row.turnover?.toString() || '0',
          payload: row.payload,  // Fallback for score parsing
          matchStates: match?.states,  // Primary source for scores from sports_data.match
          stage: match?.stage || null,                   // Match stage
          round: match?.round || null,                   // Match round
          week: match?.week || null,                     // Match week
        };
      });

      // Client-side filter: remove stale matches based on start_iso
      // IMPORTANT: Skip filtering entirely for 'past' timeFilter - trust DB filters
      const now = Date.now();
      const filteredGames = games.filter(game => {
        // For past matches, trust the Supabase filter (is_prematch=false, is_live=false)
        if (timeFilter === 'past') {
          return true;
        }
        
        const startsAt = parseInt(game.startsAt) * 1000; // startsAt is in seconds
        
        // Live games: allow up to 4h after start (matches can last 3h + overtime)
        if (game.is_live || game.state === 'Live') {
          return startsAt > now - (4 * 60 * 60 * 1000);
        }
        
        // Prematch/upcoming: must start in the future
        if (game.is_prematch || game.state === 'Prematch') {
          return startsAt > now;
        }
        
        // Default: keep the game
        return true;
      });

      return filteredGames;
    },
    staleTime,
    gcTime: staleTime * 2,
    refetchOnWindowFocus: false,
  });
};
