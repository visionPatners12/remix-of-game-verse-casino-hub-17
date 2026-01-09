import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils';
import { UserSearchResults } from './UserSearchResults';
import { LeagueSearchResults } from './LeagueSearchResults';
import { TeamSearchResults } from './TeamSearchResults';
import { PlayerSearchResults } from './PlayerSearchResults';
import { PolymarketSearchResults } from './PolymarketSearchResults';
import { RecentSearches } from './RecentSearches';
import { TrendingTopics } from './TrendingTopics';
import { SuggestedUsers } from './SuggestedUsers';
import type { 
  SearchUser, 
  SearchLeague, 
  SearchTeam,
  SearchPlayer,
  PolymarketEventSearchResult,
  PolymarketTagSearchResult,
  RecentSearch, 
  TrendingTopic, 
  SuggestedUser 
} from '../types';
import type { SearchTab } from '../hooks/useGlobalSearch';

interface CombinedSearchResultsProps {
  query: string;
  hasQuery: boolean;
  activeTab: SearchTab;
  
  // Search results
  userResults: SearchUser[];
  leagueResults: SearchLeague[];
  teamResults: SearchTeam[];
  playerResults: SearchPlayer[];
  marketResults?: PolymarketEventSearchResult[];
  marketTags?: PolymarketTagSearchResult[];
  marketTagsCount?: number;
  isLoading: boolean;
  
  // Infinite scroll
  onLoadMore?: () => void;
  hasMore?: boolean;
  
  // Event handlers for search results
  onUserClick?: (user: SearchUser) => void;
  onLeagueClick?: (league: SearchLeague) => void;
  onTeamClick?: (team: SearchTeam) => void;
  onPlayerClick?: (player: SearchPlayer) => void;
  onMarketClick?: (event: PolymarketEventSearchResult) => void;
  onMarketTagClick?: (tag: PolymarketTagSearchResult) => void;
  
  // Recent searches
  recentSearches?: RecentSearch[];
  onRecentSearchClick?: (search: RecentSearch) => void;
  onRecentSearchRemove?: (search: RecentSearch) => void;
  onClearAllRecentSearches?: () => void;
  
  // Trending topics
  trendingTopics?: TrendingTopic[];
  onTrendingTopicClick?: (topic: TrendingTopic) => void;
  
  // Suggested users
  suggestedUsers?: SuggestedUser[];
  isSuggestedLoading?: boolean;
  onSuggestedUserClick?: (user: SuggestedUser) => void;
  onFollowClick?: (user: SuggestedUser) => void;
  
  className?: string;
}

const CombinedSearchResults = React.memo<CombinedSearchResultsProps>(({
  query,
  hasQuery,
  activeTab,
  userResults,
  leagueResults,
  teamResults,
  playerResults,
  marketResults = [],
  marketTags = [],
  marketTagsCount = 0,
  isLoading,
  onUserClick,
  onLeagueClick,
  onTeamClick,
  onPlayerClick,
  onMarketClick,
  onMarketTagClick,
  recentSearches = [],
  onRecentSearchClick,
  onRecentSearchRemove,
  onClearAllRecentSearches,
  trendingTopics = [],
  onTrendingTopicClick,
  suggestedUsers = [],
  isSuggestedLoading = false,
  onSuggestedUserClick,
  onFollowClick,
  onLoadMore,
  hasMore = false,
  className
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Get results based on active tab
  const getActiveResults = useCallback(() => {
    switch (activeTab) {
      case 'users': return userResults;
      case 'leagues': return leagueResults;
      case 'teams': return teamResults;
      case 'players': return playerResults;
      case 'markets': return marketResults;
    }
  }, [activeTab, userResults, leagueResults, teamResults, playerResults, marketResults]);

  const activeResults = getActiveResults();
  const hasResults = activeResults.length > 0;
  
  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore || !hasMore || isLoading) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  if (hasQuery) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Loading state for initial search */}
        {isLoading && !hasResults && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Searching...</p>
          </div>
        )}
        
        {/* No results */}
        {!isLoading && !hasResults && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found for "{query}"</p>
          </div>
        )}
        
        {/* User Results */}
        {activeTab === 'users' && userResults.length > 0 && (
          <UserSearchResults
            results={userResults}
            query={query}
            isLoading={false}
            onUserClick={onUserClick}
          />
        )}
        
        {/* League Results */}
        {activeTab === 'leagues' && leagueResults.length > 0 && (
          <LeagueSearchResults
            results={leagueResults}
            query={query}
            isLoading={false}
            onLeagueClick={onLeagueClick}
          />
        )}
        
        {/* Team Results */}
        {activeTab === 'teams' && teamResults.length > 0 && (
          <TeamSearchResults
            results={teamResults}
            query={query}
            isLoading={false}
            onTeamClick={onTeamClick}
          />
        )}

        {/* Player Results */}
        {activeTab === 'players' && playerResults.length > 0 && (
          <PlayerSearchResults
            results={playerResults}
            query={query}
            isLoading={false}
            onPlayerClick={onPlayerClick}
          />
        )}

        {/* Market Results (Polymarket) */}
        {activeTab === 'markets' && (marketResults.length > 0 || marketTagsCount > 0) && (
          <PolymarketSearchResults
            results={marketResults}
            matchingTags={marketTags}
            tagsCount={marketTagsCount}
            query={query}
            isLoading={false}
            onEventClick={onMarketClick}
            onTagClick={onMarketTagClick}
          />
        )}
        
        {/* Loading indicator for infinite scroll */}
        {isLoading && hasResults && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mx-auto" />
          </div>
        )}
        
        {/* End of results indicator */}
        {!isLoading && hasResults && !hasMore && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">End of results</p>
          </div>
        )}
        
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-1" />
      </div>
    );
  }

  // Show discovery content when no query
  return (
    <div className={cn("-mx-4", className)}>
      {recentSearches.length > 0 && (
        <RecentSearches
          searches={recentSearches}
          onSearchClick={onRecentSearchClick}
          onSearchRemove={onRecentSearchRemove}
          onClearAll={onClearAllRecentSearches}
        />
      )}
      
      {trendingTopics.length > 0 && (
        <TrendingTopics
          topics={trendingTopics}
          onTopicClick={onTrendingTopicClick}
        />
      )}
      
      {(suggestedUsers.length > 0 || isSuggestedLoading) && (
        <SuggestedUsers
          users={suggestedUsers}
          onUserClick={onSuggestedUserClick}
          onFollowClick={onFollowClick}
          isLoading={isSuggestedLoading}
        />
      )}
    </div>
  );
});

CombinedSearchResults.displayName = 'CombinedSearchResults';

export { CombinedSearchResults };
