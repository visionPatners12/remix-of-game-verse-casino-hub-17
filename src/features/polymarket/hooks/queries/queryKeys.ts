/**
 * Centralized query keys for Polymarket data fetching
 * Ensures consistent cache invalidation and prefetching
 */

import { PolymarketTab } from '../../types/feed';

export const POLYMARKET_QUERY_KEYS = {
  // Base keys
  all: ['polymarket'] as const,
  
  // Feed keys
  feed: (tab: PolymarketTab, categorySlug?: string | null, subcategorySlug?: string | null) => 
    ['polymarket-feed', tab, categorySlug, subcategorySlug] as const,
  
  infiniteFeed: (tab: PolymarketTab, categorySlug?: string | null, subcategorySlug?: string | null) => 
    ['polymarket-infinite-feed', tab, categorySlug, subcategorySlug] as const,
  
  // Event keys
  events: () => ['polymarket-events'] as const,
  eventById: (eventId: string) => ['polymarket-event', eventId] as const,
  
  // Category keys
  categories: () => ['polymarket-categories'] as const,
  subcategories: (categoryTagId: string) => ['polymarket-subcategories', categoryTagId] as const,
  
  // Featured/trending
  featured: () => ['polymarket-featured'] as const,
  trending: () => ['polymarket-trending'] as const,
};
