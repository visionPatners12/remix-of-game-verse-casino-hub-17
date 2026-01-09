import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import type { LeagueGameRow } from '@/features/sports/types/supabase';

export interface LeagueWithCounts {
  id: string;
  slug: string;
  name: string;
  image_path?: string;
  activeGamesCount: number;
  country_name?: string;
  country_slug?: string;
}

interface UseSupabaseLeaguesNavProps {
  sportSlug: string;
  isLive?: boolean;
}

/**
 * Hook to fetch leagues navigation data from stg_azuro_games
 * Uses direct columns: league, country_name, league_azuro_slug
 */
export function useSupabaseLeaguesNav({ sportSlug, isLive }: UseSupabaseLeaguesNavProps) {
  const { data: leagues = [], isLoading, error } = useQuery({
    queryKey: ['leagues-nav-supabase', sportSlug, isLive],
    queryFn: async (): Promise<LeagueWithCounts[]> => {
      // Get sport_id from slug first
      const { data: sportData } = await sportsDataClient
        .from('sport')
        .select('id')
        .eq('slug', sportSlug)
        .maybeSingle();

      if (!sportData?.id) {
        return [];
      }

      // Query using direct columns: league, country_name, league_azuro_slug, start_iso
      let query = sportsDataClient
        .from('stg_azuro_games')
        .select('league, country_name, league_azuro_slug, league_id, start_iso')
        .eq('sport_id', sportData.id);

      // Add live or prematch filter
      if (isLive) {
        query = query.eq('is_live', true);
      } else {
        query = query.eq('is_prematch', true);
      }

      const { data: games, error: gamesError } = await query;

      if (gamesError) {
        console.error('Error fetching leagues navigation:', gamesError);
        throw gamesError;
      }

      // Group by league + country (composite key to separate same league across countries)
      const leagueMap = new Map<string, LeagueWithCounts>();
      const now = Date.now();

      ((games || []) as LeagueGameRow[]).forEach((game) => {
        // Filter by date - skip stale matches
        const startIso = game.start_iso ? new Date(game.start_iso).getTime() : 0;
        
        if (isLive) {
          // Live: only count matches started within last 4h
          if (startIso < now - (4 * 60 * 60 * 1000)) return;
        } else {
          // Prematch: only count matches starting in the future
          if (startIso <= now) return;
        }

        const leagueSlug = game.league_azuro_slug;
        const leagueName = game.league;
        const countryName = game.country_name || 'unknown';
        if (!leagueSlug || !leagueName) return;

        // Composite key: league_slug|country_name
        const uniqueKey = `${leagueSlug}|${countryName}`;

        if (!leagueMap.has(uniqueKey)) {
          leagueMap.set(uniqueKey, {
            id: uniqueKey, // Unique ID including country
            slug: leagueSlug,
            name: leagueName,
            activeGamesCount: 0,
            country_name: countryName,
            country_slug: countryName.toLowerCase().replace(/\s+/g, '-'),
          });
        }

        const league = leagueMap.get(uniqueKey)!;
        league.activeGamesCount++;
      });

      return Array.from(leagueMap.values()).sort((a, b) => 
        b.activeGamesCount - a.activeGamesCount
      );
    },
    staleTime: isLive ? 15_000 : 30_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const totalMatches = leagues.reduce((sum, league) => sum + league.activeGamesCount, 0);

  return {
    leagues,
    totalMatches,
    loading: isLoading,
    error,
  };
}
