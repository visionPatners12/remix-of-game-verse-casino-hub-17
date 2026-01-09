import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { RecentSearch, SearchUser, SearchLeague, SearchTeam } from '../types';

const MAX_RECENT_SEARCHES = 6;

export function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearch[]>('recent-searches', []);

  const addToRecentSearches = useCallback((
    query: string, 
    type: RecentSearch['type'] = 'text', 
    userData?: SearchUser,
    leagueData?: SearchLeague,
    teamData?: SearchTeam,
    metadata?: Record<string, any>
  ) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      // Remove duplicates (same query and type)
      const filtered = prev.filter(item => 
        !(item.query === query.trim() && item.type === type)
      );

      const newSearch: RecentSearch = { 
        query: query.trim(), 
        timestamp: Date.now(), 
        type,
        userData,
        leagueData,
        teamData,
        metadata
      };

      return [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, [setRecentSearches]);

  const removeRecentSearch = useCallback((query: string, type?: RecentSearch['type']) => {
    setRecentSearches(prev => 
      prev.filter(item => 
        type ? !(item.query === query && item.type === type) : item.query !== query
      )
    );
  }, [setRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  const getRecentSearchesByType = useCallback((type: RecentSearch['type']) => {
    return recentSearches.filter(search => search.type === type);
  }, [recentSearches]);

  return {
    recentSearches,
    addToRecentSearches,
    removeRecentSearch,
    clearRecentSearches,
    getRecentSearchesByType
  };
}