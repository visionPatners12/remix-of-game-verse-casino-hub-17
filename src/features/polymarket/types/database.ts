/**
 * Types alignés avec le schema Supabase polymarket
 * Ces types représentent la structure exacte des tables dans la DB
 */

// ============= Types DB bruts =============

export interface DbPolymarketEvent {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  category: string | null;
  subcategory: string | null;
  category_tag_id: string | null;
  subcategory_tag_id: string | null;
  end_date: string | null;
  volume: number | null;
  liquidity: number | null;
  active: boolean | null;
  closed: boolean | null;
  featured: boolean | null;
  raw_data: Record<string, unknown> | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
  // Relation avec markets (quand on fait un select avec *, markets(*))
  markets?: DbPolymarketMarket[];
  // Relation avec event_tags -> tags (jointure normalisée)
  event_tags?: Array<{
    tag: {
      id: string;
      label: string | null;
      slug: string | null;
    } | null;
  }>;
}

export interface DbPolymarketMarket {
  id: string;
  event_id: string | null;
  question: string | null;
  outcomes: string[] | null;
  outcome_prices: string[] | null;
  volume: number | null;
  liquidity: number | null;
  active: boolean | null;
  closed: boolean | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  clob_token_ids: string[] | null;
  best_bid: number | null;
  best_ask: number | null;
}

export interface DbPolymarketCategory {
  tag_id: string;
  slug: string | null;
  label: string | null;
  sort_order: number | null;
  is_enabled: boolean;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbPolymarketCategorySubcategory {
  id: string;
  category_tag_id: string;
  subcategory_tag_id: string;
  rank: number | null;
  is_enabled: boolean;
  label: string | null;
  slug: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ============= Types transformés pour le frontend =============

export interface TransformedSubcategory {
  id: string;
  label: string;
  slug: string;
}
