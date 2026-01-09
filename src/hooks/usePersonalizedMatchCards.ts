import { useInfiniteQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { useFavoriteTeams } from '@/features/onboarding/hooks/useFavoriteTeams';
import { useFavoriteLeagues } from '@/features/onboarding/hooks/useFavoriteLeagues';
import { useMemo } from 'react';
import type { PersonalizedMatch } from '@/types/hybrid-feed';

interface UsePersonalizedMatchCardsResult {
  matches: PersonalizedMatch[];
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Hook to fetch upcoming matches for user's favorite teams and leagues
 * Uses cursor-based pagination for infinite scroll
 */
export function usePersonalizedMatchCards(limit: number = 10): UsePersonalizedMatchCardsResult {
  const { user } = useAuth();
  const { favoriteTeams } = useFavoriteTeams();
  const { favoriteLeagues } = useFavoriteLeagues();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['personalized-matches', user?.id, favoriteTeams, favoriteLeagues, limit],
    queryFn: async ({ pageParam }) => {
      const hasFavorites = favoriteTeams.length > 0 || favoriteLeagues.length > 0;

      // Build query for upcoming matches
      let query = sportsDataClient
        .from('stg_azuro_games')
        .select(`
          id,
          azuro_game_id,
          start_iso,
          is_prematch,
          is_live,
          home_team_id,
          away_team_id,
          league_id,
          sport:sport_id(azuro_id, slug),
          league:league_id(name, logo),
          home_team:home_team_id(name, logo),
          away_team:away_team_id(name, logo)
        `)
        .eq('is_prematch', true)
        .order('start_iso', { ascending: true })
        .limit(limit);

      // Apply cursor pagination
      if (pageParam) {
        query = query.gt('start_iso', pageParam);
      }

      // Build OR filter for favorites (if user has favorites)
      if (hasFavorites) {
        const orFilters: string[] = [];
        
        if (favoriteTeams.length > 0) {
          orFilters.push(`home_team_id.in.(${favoriteTeams.join(',')})`);
          orFilters.push(`away_team_id.in.(${favoriteTeams.join(',')})`);
        }
        
        if (favoriteLeagues.length > 0) {
          orFilters.push(`league_id.in.(${favoriteLeagues.join(',')})`);
        }

        if (orFilters.length > 0) {
          query = query.or(orFilters.join(','));
        }
      }
      // If no favorites, fetch generic upcoming matches (no filter applied)

      const { data: matches, error } = await query;

      if (error) throw error;

      // Transform to PersonalizedMatch format
      const results: PersonalizedMatch[] = (matches || []).map((match: any) => ({
        id: match.id,
        gameId: match.azuro_game_id || match.id,
        startsAt: match.start_iso,
        status: match.is_live ? 'inplay' : 'prematch',
        participants: [
          { name: match.home_team?.name || 'TBD', image: match.home_team?.logo },
          { name: match.away_team?.name || 'TBD', image: match.away_team?.logo }
        ],
        sport: match.sport ? { sportId: match.sport.azuro_id, slug: match.sport.slug } : undefined,
        league: match.league ? { name: match.league.name, logo: match.league.logo } : undefined,
      }));

      // Next cursor is the last match's start_iso
      const lastMatch = matches?.[matches.length - 1];
      const next = results.length === limit ? lastMatch?.start_iso : undefined;

      return { results, next };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.next,
    enabled: !!user?.id, // Always enabled - shows generic matches if no favorites
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Flatten pages into single array
  const matches = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.results);
  }, [data]);

  return {
    matches,
    isLoading,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage
  };
}
