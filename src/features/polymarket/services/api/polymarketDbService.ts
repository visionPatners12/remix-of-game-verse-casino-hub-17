import { polymarketClient } from '@/integrations/supabase/client';
import { PolymarketEvent } from '../../types/events';
import { PolymarketMarket } from '../../types/markets';
import { 
  DbPolymarketEvent, 
  DbPolymarketMarket, 
  DbPolymarketCategory,
  DbPolymarketCategorySubcategory,
  TransformedSubcategory 
} from '../../types/database';
import { PolymarketFeedResponse, PolymarketTab } from '../../types/feed';
import { polymarketEventCache } from '../cache/eventCache';

// ============= Optimized SELECT columns =============

// Light columns for feed (excludes raw_data for ~70% smaller payloads)
const FEED_EVENT_SELECT = `
  id, slug, title, description, image, icon, category, subcategory,
  category_tag_id, subcategory_tag_id, end_date, volume, liquidity,
  active, closed, featured, likes_count, comments_count, created_at, updated_at,
  markets:markets(
    id, event_id, question, outcomes, outcome_prices, volume, 
    liquidity, active, closed, clob_token_ids, best_bid, best_ask, created_at, updated_at
  )
`;

// Full columns for event detail (includes raw_data for complete data)
// Joins event_tags -> tags for normalized tag data
const FULL_EVENT_SELECT = `
  *, 
  markets:markets(*),
  event_tags:event_tags(
    tag:tags(id, label, slug)
  )
`;

// ============= Light Transformers (for feed - no raw_data) =============

function transformDbMarketLight(dbMarket: DbPolymarketMarket): PolymarketMarket {
  return {
    id: dbMarket.id,
    question: dbMarket.question || '',
    conditionId: '',
    slug: '',
    resolutionSource: '',
    endDate: '',
    category: '',
    liquidity: String(dbMarket.liquidity || 0),
    startDate: '',
    fee: '0',
    image: '',
    icon: '',
    description: '',
    outcomes: dbMarket.outcomes || ['Yes', 'No'],
    outcomePrices: dbMarket.outcome_prices || [],
    volume: String(dbMarket.volume || 0),
    active: dbMarket.active ?? true,
    marketType: 'binary',
    closed: dbMarket.closed ?? false,
    marketMakerAddress: '',
    updatedBy: 0,
    createdAt: dbMarket.created_at,
    updatedAt: dbMarket.updated_at,
    closedTime: '',
    wideFormat: false,
    new: false,
    sentDiscord: false,
    featured: false,
    submitted_by: '',
    twitterCardLocation: '',
    twitterCardLastRefreshed: '',
    archived: false,
    resolvedBy: '',
    restricted: false,
    volumeNum: Number(dbMarket.volume) || 0,
    liquidityNum: Number(dbMarket.liquidity) || 0,
    endDateIso: '',
    startDateIso: '',
    hasReviewedDates: false,
    readyForCron: false,
    volume24hr: 0,
    volume1wk: 0,
    volume1mo: 0,
    volume1yr: 0,
    clobTokenIds: dbMarket.clob_token_ids || [],
    fpmmLive: false,
    volume1wkAmm: 0,
    volume1moAmm: 0,
    volume1yrAmm: 0,
    volume1wkClob: 0,
    volume1moClob: 0,
    volume1yrClob: 0,
    creator: '',
    ready: true,
    funded: true,
    cyom: false,
    competitive: 0,
    pagerDutyNotificationEnabled: false,
    approved: true,
    rewardsMinSize: 0,
    rewardsMaxSpread: 0,
    spread: 0,
    oneDayPriceChange: 0,
    oneHourPriceChange: 0,
    oneWeekPriceChange: 0,
    oneMonthPriceChange: 0,
    oneYearPriceChange: 0,
    lastTradePrice: 0,
    bestBid: dbMarket.best_bid ?? 0,
    bestAsk: dbMarket.best_ask ?? 0,
    clearBookOnStart: false,
    manualActivation: false,
    negRiskOther: false,
    umaResolutionStatuses: '',
    pendingDeployment: false,
    deploying: false,
    rfqEnabled: false,
    holdingRewardsEnabled: false,
  };
}

function transformDbEventLight(dbEvent: DbPolymarketEvent): PolymarketEvent {
  const event: PolymarketEvent = {
    id: dbEvent.id,
    ticker: '',
    slug: dbEvent.slug || '',
    title: dbEvent.title,
    description: dbEvent.description || '',
    resolutionSource: '',
    startDate: '',
    creationDate: '',
    endDate: dbEvent.end_date || '',
    image: dbEvent.image || '',
    icon: dbEvent.icon || '',
    active: dbEvent.active ?? true,
    closed: dbEvent.closed ?? false,
    archived: false,
    new: false,
    featured: dbEvent.featured ?? false,
    restricted: false,
    liquidity: Number(dbEvent.liquidity) || 0,
    volume: Number(dbEvent.volume) || 0,
    openInterest: 0,
    category: dbEvent.category || '',
    published_at: '',
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    competitive: 0,
    volume24hr: 0,
    volume1wk: 0,
    volume1mo: 0,
    volume1yr: 0,
    liquidityAmm: 0,
    liquidityClob: 0,
    commentCount: dbEvent.comments_count || 0,
    markets: (dbEvent.markets || []).map(transformDbMarketLight),
    series: [],
    tags: [], // Light events don't have tags - intentionally not cached
    cyom: false,
    closedTime: '',
    showAllOutcomes: false,
    showMarketImages: false,
    enableNegRisk: false,
    seriesSlug: '',
    negRiskAugmented: false,
    pendingDeployment: false,
    deploying: false,
  };
  
  // Don't cache light events (without tags) to avoid polluting cache used by fetchEventById
  return event;
}

// ============= Full Transformers (for details - with raw_data) =============

function transformDbMarketFull(dbMarket: DbPolymarketMarket): PolymarketMarket {
  const rawData = dbMarket.raw_data || {};
  
  return {
    id: dbMarket.id,
    question: dbMarket.question || '',
    conditionId: (rawData.conditionId as string) || '',
    slug: (rawData.slug as string) || '',
    resolutionSource: (rawData.resolutionSource as string) || '',
    endDate: (rawData.endDate as string) || '',
    category: (rawData.category as string) || '',
    liquidity: String(dbMarket.liquidity || 0),
    startDate: (rawData.startDate as string) || '',
    fee: (rawData.fee as string) || '0',
    image: (rawData.image as string) || '',
    icon: (rawData.icon as string) || '',
    description: (rawData.description as string) || '',
    outcomes: dbMarket.outcomes || ['Yes', 'No'],
    outcomePrices: dbMarket.outcome_prices || [],
    volume: String(dbMarket.volume || 0),
    active: dbMarket.active ?? true,
    marketType: (rawData.marketType as string) || 'binary',
    closed: dbMarket.closed ?? false,
    marketMakerAddress: (rawData.marketMakerAddress as string) || '',
    updatedBy: 0,
    createdAt: dbMarket.created_at,
    updatedAt: dbMarket.updated_at,
    closedTime: (rawData.closedTime as string) || '',
    wideFormat: false,
    new: false,
    sentDiscord: false,
    featured: false,
    submitted_by: '',
    twitterCardLocation: '',
    twitterCardLastRefreshed: '',
    archived: false,
    resolvedBy: '',
    restricted: false,
    volumeNum: Number(dbMarket.volume) || 0,
    liquidityNum: Number(dbMarket.liquidity) || 0,
    endDateIso: (rawData.endDateIso as string) || '',
    startDateIso: (rawData.startDateIso as string) || '',
    hasReviewedDates: false,
    readyForCron: false,
    volume24hr: (rawData.volume24hr as number) || 0,
    volume1wk: (rawData.volume1wk as number) || 0,
    volume1mo: (rawData.volume1mo as number) || 0,
    volume1yr: (rawData.volume1yr as number) || 0,
    clobTokenIds: dbMarket.clob_token_ids || (rawData.clobTokenIds as string[]) || [],
    fpmmLive: false,
    volume1wkAmm: 0,
    volume1moAmm: 0,
    volume1yrAmm: 0,
    volume1wkClob: 0,
    volume1moClob: 0,
    volume1yrClob: 0,
    creator: '',
    ready: true,
    funded: true,
    cyom: false,
    competitive: 0,
    pagerDutyNotificationEnabled: false,
    approved: true,
    rewardsMinSize: 0,
    rewardsMaxSpread: 0,
    spread: 0,
    oneDayPriceChange: (rawData.oneDayPriceChange as number) || 0,
    oneHourPriceChange: (rawData.oneHourPriceChange as number) || 0,
    oneWeekPriceChange: (rawData.oneWeekPriceChange as number) || 0,
    oneMonthPriceChange: (rawData.oneMonthPriceChange as number) || 0,
    oneYearPriceChange: (rawData.oneYearPriceChange as number) || 0,
    lastTradePrice: (rawData.lastTradePrice as number) || 0,
    bestBid: dbMarket.best_bid ?? (rawData.bestBid as number) ?? 0,
    bestAsk: dbMarket.best_ask ?? (rawData.bestAsk as number) ?? 0,
    clearBookOnStart: false,
    manualActivation: false,
    negRiskOther: false,
    umaResolutionStatuses: '',
    pendingDeployment: false,
    deploying: false,
    rfqEnabled: false,
    holdingRewardsEnabled: false,
  };
}

function transformDbEventFull(dbEvent: DbPolymarketEvent): PolymarketEvent {
  const rawData = dbEvent.raw_data || {};
  
  // Transform tags from event_tags join (normalized DB) or fallback to raw_data
  const tags: PolymarketEvent['tags'] = [];
  if (dbEvent.event_tags && Array.isArray(dbEvent.event_tags)) {
    for (const et of dbEvent.event_tags) {
      if (et.tag) {
        tags.push({
          id: String(et.tag.id),
          label: et.tag.label || '',
          slug: et.tag.slug || '',
          forceShow: false,
          updatedAt: ''
        });
      }
    }
  } else if (rawData.tags && Array.isArray(rawData.tags)) {
    // Fallback to raw_data.tags if no joined tags
    for (const t of rawData.tags as any[]) {
      tags.push({
        id: String(t.id || ''),
        label: t.label || '',
        slug: t.slug || '',
        forceShow: t.forceShow || false,
        updatedAt: t.updatedAt || ''
      });
    }
  }
  
  const event: PolymarketEvent = {
    id: dbEvent.id,
    ticker: (rawData.ticker as string) || '',
    slug: dbEvent.slug || '',
    title: dbEvent.title,
    description: dbEvent.description || '',
    resolutionSource: (rawData.resolutionSource as string) || '',
    startDate: (rawData.startDate as string) || '',
    creationDate: (rawData.creationDate as string) || '',
    endDate: dbEvent.end_date || '',
    image: dbEvent.image || '',
    icon: dbEvent.icon || '',
    active: dbEvent.active ?? true,
    closed: dbEvent.closed ?? false,
    archived: (rawData.archived as boolean) || false,
    new: (rawData.new as boolean) || false,
    featured: dbEvent.featured ?? false,
    restricted: (rawData.restricted as boolean) || false,
    liquidity: Number(dbEvent.liquidity) || 0,
    volume: Number(dbEvent.volume) || 0,
    openInterest: (rawData.openInterest as number) || 0,
    category: dbEvent.category || '',
    published_at: (rawData.published_at as string) || '',
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    competitive: (rawData.competitive as number) || 0,
    volume24hr: (rawData.volume24hr as number) || 0,
    volume1wk: (rawData.volume1wk as number) || 0,
    volume1mo: (rawData.volume1mo as number) || 0,
    volume1yr: (rawData.volume1yr as number) || 0,
    liquidityAmm: (rawData.liquidityAmm as number) || 0,
    liquidityClob: (rawData.liquidityClob as number) || 0,
    commentCount: dbEvent.comments_count || 0,
    markets: (dbEvent.markets || []).map(transformDbMarketFull),
    series: (rawData.series as PolymarketEvent['series']) || [],
    tags,
    cyom: (rawData.cyom as boolean) || false,
    closedTime: (rawData.closedTime as string) || '',
    showAllOutcomes: (rawData.showAllOutcomes as boolean) || false,
    showMarketImages: (rawData.showMarketImages as boolean) || false,
    enableNegRisk: (rawData.enableNegRisk as boolean) || false,
    seriesSlug: (rawData.seriesSlug as string) || '',
    negRiskAugmented: (rawData.negRiskAugmented as boolean) || false,
    pendingDeployment: false,
    deploying: false,
  };
  
  // Cache the full event
  polymarketEventCache.set(event);
  
  return event;
}

// ============= Service =============

export const polymarketDbService = {
  /**
   * Fetch events par tab (trending, new, breaking) - uses light SELECT
   */
  async fetchEventsByTab(
    tab: PolymarketTab,
    limit = 40,
    offset = 0
  ): Promise<PolymarketFeedResponse> {
    let query = (polymarketClient as any)
      .from('events')
      .select(FEED_EVENT_SELECT, { count: 'exact' })
      .eq('active', true)
      .eq('closed', false);

    // Tri selon le tab
    switch (tab) {
      case 'trending':
        query = query.order('volume', { ascending: false, nullsFirst: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'breaking':
        query = query
          .gt('volume', 10000)
          .order('updated_at', { ascending: false });
        break;
      default:
        query = query.order('volume', { ascending: false, nullsFirst: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    if (error) throw error;

    const events = ((data || []) as unknown as DbPolymarketEvent[]).map(transformDbEventLight);

    return {
      ok: true,
      tab,
      query: {
        limit,
        offset,
        categorySlug: null,
        subSlug: null,
        includePrices: false,
        includeBuySell: false,
        priceSide: null,
      },
      cache: { gamma: 'HIT', prices: 'SKIP' },
      subcategories: null,
      data: events,
      prices: null,
    };
  },

  /**
   * Fetch events par categorie (uses light SELECT)
   */
  async fetchEventsByCategory(
    categoryTagId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<PolymarketFeedResponse> {
    const { limit = 40, offset = 0 } = options;

    const { data, error, count } = await (polymarketClient as any)
      .from('events')
      .select(FEED_EVENT_SELECT, { count: 'exact' })
      .eq('category_tag_id', categoryTagId)
      .eq('active', true)
      .eq('closed', false)
      .order('volume', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const events = ((data || []) as unknown as DbPolymarketEvent[]).map(transformDbEventLight);

    // Fetch subcategories pour cette categorie
    const subcategories = await this.fetchSubcategories(categoryTagId);

    return {
      ok: true,
      tab: 'category',
      query: {
        limit,
        offset,
        categorySlug: categoryTagId,
        subSlug: null,
        includePrices: false,
        includeBuySell: false,
        priceSide: null,
      },
      cache: { gamma: 'HIT', prices: 'SKIP' },
      subcategories,
      data: events,
      prices: null,
    };
  },

  /**
   * Fetch events par sous-categorie (uses light SELECT)
   */
  async fetchEventsBySubcategory(
    categoryTagId: string,
    subcategoryTagId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<PolymarketFeedResponse> {
    const { limit = 40, offset = 0 } = options;

    const { data, error } = await (polymarketClient as any)
      .from('events')
      .select(FEED_EVENT_SELECT, { count: 'exact' })
      .eq('subcategory_tag_id', subcategoryTagId)
      .eq('active', true)
      .eq('closed', false)
      .order('volume', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const events = ((data || []) as unknown as DbPolymarketEvent[]).map(transformDbEventLight);

    // Fetch subcategories pour cette categorie
    const subcategories = await this.fetchSubcategories(categoryTagId);

    return {
      ok: true,
      tab: 'subcategory',
      query: {
        limit,
        offset,
        categorySlug: categoryTagId,
        subSlug: subcategoryTagId,
        includePrices: false,
        includeBuySell: false,
        priceSide: null,
      },
      cache: { gamma: 'HIT', prices: 'SKIP' },
      subcategories,
      data: events,
      prices: null,
    };
  },

  /**
   * Fetch event par ID with full data (uses FULL SELECT)
   * Checks cache first for performance
   */
  async fetchEventById(eventId: string): Promise<PolymarketEvent> {
    // Check cache first
    const cached = polymarketEventCache.get(eventId);
    if (cached) {
      return cached;
    }

    const { data, error } = await (polymarketClient as any)
      .from('events')
      .select(FULL_EVENT_SELECT)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Event not found');

    return transformDbEventFull(data as unknown as DbPolymarketEvent);
  },

  /**
   * Fetch toutes les categories actives
   */
  async fetchCategories(): Promise<DbPolymarketCategory[]> {
    const { data, error } = await (polymarketClient as any)
      .from('categories')
      .select('tag_id, slug, label, sort_order, is_enabled')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data || []) as unknown as DbPolymarketCategory[];
  },

  /**
   * Récupère une catégorie par son slug
   */
  async getCategoryBySlug(slug: string): Promise<DbPolymarketCategory | null> {
    const { data, error } = await (polymarketClient as any)
      .from('categories')
      .select('tag_id, slug, label, sort_order, is_enabled')
      .eq('slug', slug)
      .eq('is_enabled', true)
      .maybeSingle();

    if (error) return null;
    return data as unknown as DbPolymarketCategory | null;
  },

  /**
   * Fetch sous-categories d'une categorie
   */
  async fetchSubcategories(categoryTagId: string): Promise<TransformedSubcategory[]> {
    const { data, error } = await (polymarketClient as any)
      .from('category_subcategories')
      .select('category_tag_id, subcategory_tag_id, rank, is_enabled, label, slug')
      .eq('category_tag_id', categoryTagId)
      .eq('is_enabled', true)
      .order('rank', { ascending: true, nullsFirst: false });

    if (error) throw error;

    return ((data || []) as unknown as DbPolymarketCategorySubcategory[]).map(sub => ({
      id: sub.subcategory_tag_id,
      label: sub.label || '',
      slug: sub.slug || '',
    }));
  },
  
  /**
   * Invalidate cache for a specific event
   */
  invalidateEvent(eventId: string): void {
    polymarketEventCache.invalidate(eventId);
  },
  
  /**
   * Invalidate all cached events
   */
  invalidateAllEvents(): void {
    polymarketEventCache.invalidateAll();
  },
};
