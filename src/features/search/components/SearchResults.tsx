import React from 'react';
import { UserSearchResults } from './UserSearchResults';
import { RecentSearches } from './RecentSearches';
import { TrendingTopics } from './TrendingTopics';
import { SuggestedUsers } from './SuggestedUsers';
import type { SearchUser, RecentSearch, TrendingTopic, SuggestedUser } from '../types';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  // Search query and state
  query: string;
  hasQuery: boolean;
  
  // User search results
  userResults: SearchUser[];
  isUserSearchLoading: boolean;
  onUserClick?: (user: SearchUser) => void;
  
  // Recent searches
  recentSearches: RecentSearch[];
  onRecentSearchClick: (search: RecentSearch) => void;
  onRecentSearchRemove: (search: RecentSearch) => void;
  onClearRecentSearches?: () => void;
  
  // Trending topics
  trendingTopics: TrendingTopic[];
  onTrendingTopicClick: (topic: TrendingTopic) => void;
  isTrendingLoading?: boolean;
  
  // Suggested users
  suggestedUsers: SuggestedUser[];
  onSuggestedUserClick?: (user: SuggestedUser) => void;
  onFollowClick?: (user: SuggestedUser) => void;
  isSuggestedLoading?: boolean;
  
  // Layout and styling
  className?: string;
  maxUserResults?: number;
  maxRecentSearches?: number;
  maxTrendingTopics?: number;
  maxSuggestedUsers?: number;
}

export const SearchResults = React.memo<SearchResultsProps>(({
  query,
  hasQuery,
  userResults,
  isUserSearchLoading,
  onUserClick,
  recentSearches,
  onRecentSearchClick,
  onRecentSearchRemove,
  onClearRecentSearches,
  trendingTopics,
  onTrendingTopicClick,
  isTrendingLoading = false,
  suggestedUsers,
  onSuggestedUserClick,
  onFollowClick,
  isSuggestedLoading = false,
  className,
  maxUserResults = 15,
  maxRecentSearches = 6,
  maxTrendingTopics = 5,
  maxSuggestedUsers = 3
}) => {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {/* User search results - shown when there's a query */}
      {hasQuery && (
        <UserSearchResults
          results={userResults}
          query={query}
          isLoading={isUserSearchLoading}
          onUserClick={onUserClick}
          maxResults={maxUserResults}
        />
      )}
      
      {/* Recent searches - shown when no query */}
      {!hasQuery && recentSearches.length > 0 && (
        <RecentSearches
          searches={recentSearches}
          onSearchClick={onRecentSearchClick}
          onSearchRemove={onRecentSearchRemove}
          onClearAll={onClearRecentSearches}
          maxResults={maxRecentSearches}
        />
      )}
      
      {/* Trending topics - shown when no query */}
      {!hasQuery && (
        <TrendingTopics
          topics={trendingTopics}
          onTopicClick={onTrendingTopicClick}
          maxResults={maxTrendingTopics}
          isLoading={isTrendingLoading}
        />
      )}
      
      {/* Suggested users - shown when no query */}
      {!hasQuery && (
        <SuggestedUsers
          users={suggestedUsers}
          onUserClick={onSuggestedUserClick}
          onFollowClick={onFollowClick}
          maxResults={maxSuggestedUsers}
          isLoading={isSuggestedLoading}
        />
      )}
    </div>
  );
});

SearchResults.displayName = 'SearchResults';