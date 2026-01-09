export const POLYMARKET_QUERY_KEYS = {
  events: (category?: string | null) => 
    category ? ['polymarket-events', category] : ['polymarket-events'],
  featuredEvents: () => ['polymarket-featured-events'],
  eventById: (eventId?: string) => ['polymarket-event', eventId],
  feed: (tab: string, category?: string | null, subcategory?: string | null) => 
    ['polymarket-feed', tab, category, subcategory],
} as const;
