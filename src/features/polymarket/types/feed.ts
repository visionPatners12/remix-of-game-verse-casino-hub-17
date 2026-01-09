import { PolymarketEvent } from './events';

export type PolymarketTab = 'trending' | 'new' | 'breaking' | 'category' | 'subcategory' | 'event';

export interface PolymarketSubcategory {
  id: string;
  label: string;
  slug: string;
  forceShow?: boolean;
  updatedAt?: string;
}

export interface PolymarketFeedRequest {
  tab?: PolymarketTab;
  eventId?: number;
  eventSlug?: string;
  categorySlug?: string;
  subSlug?: string;
  limit?: number;
  offset?: number;
  includePrices?: boolean;
  includeBuySell?: boolean;
  priceSide?: 'BUY' | 'SELL';
  maxTokensForPrices?: number;
  includeSubcategories?: boolean;
}

export interface PolymarketFeedResponse {
  ok: boolean;
  tab: PolymarketTab;
  query: {
    limit: number;
    offset: number;
    categorySlug: string | null;
    subSlug: string | null;
    includePrices: boolean;
    includeBuySell: boolean;
    priceSide: string | null;
  };
  cache: {
    gamma: 'HIT' | 'MISS';
    prices: 'HIT' | 'MISS' | 'SKIP';
  };
  subcategories: PolymarketSubcategory[] | null;
  data: PolymarketEvent[];
  prices: Record<string, string> | null;
  error?: string;
  details?: string;
}
