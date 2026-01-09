/**
 * Search filter types and interfaces
 */

export interface SearchFilters {
  type?: 'user' | 'post' | 'news' | 'all';
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  verified?: boolean;
  hasImage?: boolean;
  minFollowers?: number;
  category?: string[];
  location?: string;
  sortBy?: 'relevance' | 'recent' | 'popular' | 'followers';
}

export interface FilterOption<T = string> {
  label: string;
  value: T;
  count?: number;
  icon?: string;
}

export interface ActiveFilter {
  key: keyof SearchFilters;
  value: any;
  label: string;
}