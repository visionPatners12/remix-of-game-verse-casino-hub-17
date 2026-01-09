// Export all search feature modules
export * from './types';
export * from './hooks';
export * from './components';

export * from './services';
export * from './utils';

// Re-export commonly used items for convenience
export { useSearchHistory, useTrendingTopics, useGlobalSearch, useEntitySearch } from './hooks';
export type { SearchTab, EntityType } from './hooks';
export { SearchBar, SearchResults, UserSearchResults, PlayerSearchResults } from './components';