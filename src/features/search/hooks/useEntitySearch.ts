import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import type { SearchUser, SearchLeague, SearchTeam, SearchPlayer } from '../types';

export type EntityType = 'users' | 'leagues' | 'teams' | 'players';

interface UseEntitySearchOptions {
  entityType: EntityType;
  query: string;
  enabled: boolean;
  favoriteSportIds?: string[];
  debounceMs?: number;
  limit?: number;
}

interface UseEntitySearchReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

const LIMIT = 15;
const MIN_QUERY_LENGTH = 2;

// Query keys centralisées pour invalidation
export const entitySearchKeys = {
  all: ['entity-search'] as const,
  entity: (type: EntityType, query: string, favoriteSportIds: string[]) => 
    [...entitySearchKeys.all, type, query, favoriteSportIds] as const,
};

// Fonctions de recherche par type d'entité
async function searchUsers(query: string, limit: number, offset: number) {
  const { data, error } = await supabase.rpc('search_users', {
    search_term: query,
    limit_count: limit
  });
  
  if (error) throw error;
  
  const results = (data || []).map((u: any) => ({
    id: u.id,
    username: u.username,
    first_name: u.first_name,
    last_name: u.last_name,
    avatar_url: u.avatar_url,
    bio: u.bio,
    similarity_score: u.similarity_score
  }));
  
  // Users RPC ne supporte pas la pagination
  return { data: results, hasMore: false };
}

async function searchLeagues(query: string, favoriteSportIds: string[], limit: number, offset: number) {
  const { data, error } = await supabase.rpc('search_leagues_sports_data', {
    q: query,
    favorite_sport_ids: favoriteSportIds,
    n: limit,
    page_offset: offset
  });
  
  if (error) throw error;
  
  const results = (data || []).map((l: any) => ({
    league_id: l.league_id,
    league_name: l.league_name,
    league_slug: l.league_slug,
    league_logo: l.league_logo,
    country_id: l.country_id,
    country_name: l.country_name,
    country_slug: l.country_slug,
    sport_id: l.sport_id,
    sport_name: l.sport_name,
    sport_slug: l.sport_slug,
    sport_icon: l.sport_icon,
    rank: l.rank
  }));
  
  return { data: results, hasMore: results.length >= limit };
}

async function searchTeams(query: string, favoriteSportIds: string[], limit: number, offset: number) {
  const { data, error } = await supabase.rpc('search_teams_sports_data', {
    q: query,
    favorite_sport_ids: favoriteSportIds,
    n: limit,
    page_offset: offset
  });
  
  if (error) throw error;
  
  const results = (data || []).map((t: any) => ({
    id: t.team_id,
    name: t.team_name,
    slug: t.team_slug,
    logo: t.team_logo,
    country_id: t.country_id,
    country_name: t.country_name,
    sport_id: t.sport_id,
    sport_name: t.sport_name,
    sport_slug: t.sport_slug,
    sport_icon: t.sport_icon,
    rank: t.rank
  }));
  
  return { data: results, hasMore: results.length >= limit };
}

async function searchPlayers(query: string, favoriteSportIds: string[], limit: number, offset: number) {
  const { data, error } = await supabase.rpc('search_players_sports_data', {
    q: query,
    favorite_sport_ids: favoriteSportIds,
    n: limit,
    page_offset: offset
  });
  
  if (error) throw error;
  
  const results = (data || []).map((p: any) => ({
    id: p.player_id,
    name: p.player_name,
    logo: p.player_logo,
    sport_id: p.sport_id,
    sport_name: p.sport_name,
    sport_slug: p.sport_slug,
    sport_icon: p.sport_icon,
    team_name: p.team_name,
    rank: p.rank
  }));
  
  return { data: results, hasMore: results.length >= limit };
}

/**
 * Generic hook for entity-specific search with React Query infinite scroll
 * Uses server-side RPC functions for proper sorting by favorite sports and relevance
 * Cache: 5 minutes staleTime, 10 minutes gcTime
 */
export function useEntitySearch<T>(options: UseEntitySearchOptions): UseEntitySearchReturn<T> {
  const { 
    entityType, 
    query, 
    enabled, 
    favoriteSportIds = [],
    debounceMs = 300, 
    limit = LIMIT 
  } = options;
  
  const queryClient = useQueryClient();
  const debouncedQuery = useDebounce(query, debounceMs);
  const trimmedQuery = debouncedQuery.trim();
  
  // Memoize query key
  const queryKey = useMemo(
    () => entitySearchKeys.entity(entityType, trimmedQuery, favoriteSportIds),
    [entityType, trimmedQuery, favoriteSportIds]
  );

  // Fonction de recherche typée
  const searchFn = useCallback(async (pageParam: number): Promise<{ data: T[]; hasMore: boolean }> => {
    switch (entityType) {
      case 'users':
        return searchUsers(trimmedQuery, limit, pageParam) as Promise<{ data: T[]; hasMore: boolean }>;
      case 'leagues':
        return searchLeagues(trimmedQuery, favoriteSportIds, limit, pageParam) as Promise<{ data: T[]; hasMore: boolean }>;
      case 'teams':
        return searchTeams(trimmedQuery, favoriteSportIds, limit, pageParam) as Promise<{ data: T[]; hasMore: boolean }>;
      case 'players':
        return searchPlayers(trimmedQuery, favoriteSportIds, limit, pageParam) as Promise<{ data: T[]; hasMore: boolean }>;
      default:
        return { data: [] as T[], hasMore: false };
    }
  }, [entityType, trimmedQuery, favoriteSportIds, limit]);

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => searchFn(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((acc, page) => acc + page.data.length, 0);
    },
    initialPageParam: 0,
    enabled: enabled && trimmedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: 1000 * 60 * 5,       // 5 minutes - cache entre changements de tabs
    gcTime: 1000 * 60 * 10,          // 10 minutes en cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,           // Utiliser le cache au montage
  });

  // Flatten pages pour l'API existante
  const flattenedData = useMemo((): T[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const reset = useCallback(() => {
    queryClient.removeQueries({ queryKey: entitySearchKeys.entity(entityType, trimmedQuery, favoriteSportIds) });
  }, [queryClient, entityType, trimmedQuery, favoriteSportIds]);

  return {
    data: flattenedData,
    isLoading: isLoading || isFetchingNextPage,
    error: error ? (error instanceof Error ? error.message : 'Search failed') : null,
    hasMore: hasNextPage ?? false,
    loadMore,
    reset
  };
}