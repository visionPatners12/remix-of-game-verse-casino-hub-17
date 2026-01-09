import { useState, useCallback } from 'react';
import { useEntitySearch, EntityType } from './useEntitySearch';
import { usePolymarketSearch } from './usePolymarketSearch';
import type { SearchUser, SearchLeague, SearchTeam, SearchPlayer, PolymarketEventSearchResult, PolymarketTagSearchResult } from '../types';

export type SearchTab = 'users' | 'leagues' | 'teams' | 'players' | 'markets';

interface UseGlobalSearchReturn {
  // Query state
  query: string;
  setQuery: (query: string) => void;
  
  // Tab state
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
  
  // Results (already sorted by server)
  users: SearchUser[];
  leagues: SearchLeague[];
  teams: SearchTeam[];
  players: SearchPlayer[];
  markets: PolymarketEventSearchResult[];
  
  // Polymarket tags
  marketTags: PolymarketTagSearchResult[];
  marketTagsCount: number;
  
  // Loading/error states
  isLoading: boolean;
  error: string | null;
  
  // Infinite scroll
  loadMore: () => void;
  hasMore: boolean;
  
  // Utilities
  clearResults: () => void;
  hasResults: boolean;
}

export function useGlobalSearch(
  debounceMs: number = 300,
  favoriteSportIds: string[] = []
): UseGlobalSearchReturn {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('users');

  // Entity-specific searches - only enabled for active tab
  // Results come pre-sorted from server RPCs
  const usersSearch = useEntitySearch<SearchUser>({
    entityType: 'users',
    query,
    enabled: activeTab === 'users',
    debounceMs
  });

  const leaguesSearch = useEntitySearch<SearchLeague>({
    entityType: 'leagues',
    query,
    enabled: activeTab === 'leagues',
    favoriteSportIds,
    debounceMs
  });

  const teamsSearch = useEntitySearch<SearchTeam>({
    entityType: 'teams',
    query,
    enabled: activeTab === 'teams',
    favoriteSportIds,
    debounceMs
  });

  const playersSearch = useEntitySearch<SearchPlayer>({
    entityType: 'players',
    query,
    enabled: activeTab === 'players',
    favoriteSportIds,
    debounceMs
  });

  const marketsSearch = usePolymarketSearch({
    query,
    enabled: activeTab === 'markets',
    debounceMs
  });

  // Get current tab's state
  const getCurrentTabState = useCallback(() => {
    switch (activeTab) {
      case 'users': return usersSearch;
      case 'leagues': return leaguesSearch;
      case 'teams': return teamsSearch;
      case 'players': return playersSearch;
      case 'markets': return marketsSearch;
    }
  }, [activeTab, usersSearch, leaguesSearch, teamsSearch, playersSearch, marketsSearch]);

  const currentTabState = getCurrentTabState();

  const loadMore = useCallback(() => {
    currentTabState.loadMore();
  }, [currentTabState]);

  const clearResults = useCallback(() => {
    setQuery('');
    usersSearch.reset();
    leaguesSearch.reset();
    teamsSearch.reset();
    playersSearch.reset();
    marketsSearch.reset();
  }, [usersSearch, leaguesSearch, teamsSearch, playersSearch, marketsSearch]);

  const hasResults = 
    usersSearch.data.length > 0 || 
    leaguesSearch.data.length > 0 || 
    teamsSearch.data.length > 0 || 
    playersSearch.data.length > 0 ||
    marketsSearch.data.length > 0;

  return {
    query,
    setQuery,
    activeTab,
    setActiveTab,
    // Results already sorted by server - no client-side sorting needed
    users: usersSearch.data,
    leagues: leaguesSearch.data,
    teams: teamsSearch.data,
    players: playersSearch.data,
    markets: marketsSearch.data,
    marketTags: marketsSearch.matchingTags,
    marketTagsCount: marketsSearch.tagsCount,
    isLoading: currentTabState.isLoading,
    error: currentTabState.error,
    loadMore,
    hasMore: currentTabState.hasMore,
    clearResults,
    hasResults
  };
}
