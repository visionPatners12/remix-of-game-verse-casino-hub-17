import type { SearchUser, RecentSearch, TrendingTopic } from '../types';

/**
 * Formatting utilities for search results and display
 */

/**
 * Format user display name
 */
export function formatUserDisplayName(user: SearchUser): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username || 'User';
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: SearchUser): string {
  if (user.username) {
    return user.username.slice(0, 2).toUpperCase();
  }
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  return '??';
}

/**
 * Format follower count with K/M suffixes
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format search timestamp for display
 */
export function formatSearchTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format trending topic growth percentage
 */
export function formatGrowthPercentage(growth?: number): string | null {
  if (!growth) return null;
  const percentage = Math.round(growth * 100);
  return percentage > 0 ? `+${percentage}%` : `${percentage}%`;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(
  text: string, 
  searchQuery: string, 
  className: string = 'bg-yellow-200 dark:bg-yellow-800'
): string {
  if (!searchQuery.trim()) return text;

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<mark class="${className}">$1</mark>`);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get search result summary text
 */
export function getSearchResultSummary(
  userCount: number, 
  query: string,
  isLoading: boolean
): string {
  if (isLoading) {
    return 'Searching...';
  }
  
  if (userCount === 0) {
    return `No results for "${query}"`;
  }
  
  if (userCount === 1) {
    return `1 user found for "${query}"`;
  }
  
  return `${userCount} users found for "${query}"`;
}

/**
 * Sort search results by relevance
 */
export function sortSearchResults<T extends { similarity_score?: number }>(
  results: T[],
  sortBy: 'relevance' | 'recent' | 'popular' = 'relevance'
): T[] {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.similarity_score || 0) - (a.similarity_score || 0);
      
      case 'recent':
        // Would need timestamp field
        return 0;
      
      case 'popular':
        // Would need popularity metric
        return 0;
      
      default:
        return 0;
    }
  });
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  return text.match(hashtagRegex) || [];
}

/**
 * Extract mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@[\w]+/g;
  return text.match(mentionRegex) || [];
}

/**
 * Clean search query for display
 */
export function cleanSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .substring(0, 100); // Limit length
}

/**
 * Generate search result key for React lists
 */
export function generateSearchResultKey(
  result: any, 
  index: number, 
  type: string = 'item'
): string {
  if (result.id) {
    return `${type}-${result.id}`;
  }
  if (result.username) {
    return `${type}-${result.username}-${index}`;
  }
  return `${type}-${index}`;
}