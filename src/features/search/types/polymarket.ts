/**
 * Polymarket search types
 */

export interface PolymarketTagSearchResult {
  id: string;
  slug: string;
  label: string;
}

export interface PolymarketEventSearchResult {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  category: string | null;
  volume: number;
  liquidity: number;
  end_date: string | null;
  active: boolean;
  tag_label: string;
  tag_slug: string;
}

export interface PolymarketSearchRpcResult {
  event_id: string;
  title: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  category: string | null;
  volume: number;
  liquidity: number;
  end_date: string | null;
  active: boolean;
  tag_id: string;
  tag_label: string;
  tag_slug: string;
  total_tags_count: number;
}
