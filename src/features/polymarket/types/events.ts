// Re-export market type for convenience
export { type PolymarketMarket } from './markets';

/**
 * Raw CLOB prices format from API
 * Format: { "tokenId:BUY": price, "tokenId:SELL": price }
 */
export type ClobPricesMap = Record<string, string | number> | null;

export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  resolutionSource: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  category: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  competitive: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  liquidityAmm: number;
  liquidityClob: number;
  commentCount: number;
  markets: import('./markets').PolymarketMarket[];
  series: PolymarketSeries[];
  tags: PolymarketTag[];
  cyom: boolean;
  closedTime: string;
  showAllOutcomes: boolean;
  showMarketImages: boolean;
  enableNegRisk: boolean;
  seriesSlug: string;
  negRiskAugmented: boolean;
  pendingDeployment: boolean;
  deploying: boolean;
}

export interface PolymarketSeries {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  seriesType: string;
  recurrence: string;
  image: string;
  icon: string;
  layout: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  publishedAt: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  commentsEnabled: boolean;
  competitive: string;
  volume24hr: number;
  startDate: string;
  commentCount: number;
}

export interface PolymarketTag {
  id: string;
  label: string;
  slug: string;
  forceShow: boolean;
  updatedAt: string;
}

export interface PolymarketEventsResponse {
  events: PolymarketEvent[];
  total: number;
  hasMore: boolean;
}

/**
 * Extended event with additional data from cache/hooks
 */
export interface EnrichedPolymarketEvent extends PolymarketEvent {
  likes_count?: number;
  comments_count?: number;
  _likesCount?: number;
  _commentsCount?: number;
  _clobPrices?: ClobPricesMap;
}