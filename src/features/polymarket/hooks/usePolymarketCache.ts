import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { polymarketClient } from '@/integrations/supabase/client';
import { PolymarketEvent } from '../types/events';
import { PolymarketMarket } from '../types/markets';
import { DbPolymarketMarket } from '../types/database';

// Sync a single event to Supabase cache
export async function syncEventToCache(event: PolymarketEvent): Promise<void> {
  const eventData = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    image: event.image,
    icon: event.icon,
    category: event.category,
    end_date: event.endDate,
    volume: event.volume || 0,
    liquidity: event.liquidity || 0,
    active: event.active,
    closed: event.closed,
    featured: event.featured,
    raw_data: event as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Upsert event
  const { error: eventError } = await polymarketClient
    .from('events')
    .upsert(eventData, { onConflict: 'id' });

  if (eventError) {
    console.error('Error syncing event to cache:', eventError);
    throw eventError;
  }

  // Sync markets if present
  if (event.markets && event.markets.length > 0) {
    const marketsData = event.markets.map((market: PolymarketMarket) => ({
      id: market.id,
      event_id: event.id,
      question: market.question,
      outcomes: market.outcomes,
      outcome_prices: market.outcomePrices,
      volume: market.volumeNum || parseFloat(market.volume) || 0,
      liquidity: market.liquidityNum || parseFloat(market.liquidity) || 0,
      end_date: market.endDateIso || market.endDate,
      active: market.active,
      closed: market.closed,
      raw_data: market as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    }));

    const { error: marketsError } = await polymarketClient
      .from('markets')
      .upsert(marketsData, { onConflict: 'id' });

    if (marketsError) {
      console.error('Error syncing markets to cache:', marketsError);
    }
  }
}

// Sync multiple events
export async function syncEventsToCache(events: PolymarketEvent[]): Promise<void> {
  await Promise.all(events.map(syncEventToCache));
}

// Get cached event by ID - uses denormalized columns instead of raw_data
export async function getCachedEvent(eventId: string): Promise<(PolymarketEvent & { _likesCount: number; _commentsCount: number }) | null> {
  const { data, error } = await polymarketClient
    .from('events')
    .select(`
      id, slug, title, description, image, icon, category, subcategory,
      category_tag_id, subcategory_tag_id, end_date, volume, liquidity,
      active, closed, featured, likes_count, comments_count,
      markets (
        id, event_id, question, outcomes, outcome_prices,
        volume, liquidity, active, closed, clob_token_ids, best_bid, best_ask
      )
    `)
    .eq('id', eventId)
    .maybeSingle();

  if (error || !data) return null;

  // Transform to PolymarketEvent format using denormalized columns
  // Use type assertion since we're building a partial event with essential fields
  const event = {
    id: data.id,
    ticker: '',
    slug: data.slug || '',
    title: data.title,
    description: data.description || '',
    resolutionSource: '',
    startDate: '',
    creationDate: '',
    endDate: data.end_date || '',
    image: data.image || '',
    icon: data.icon || '',
    active: data.active ?? true,
    closed: data.closed ?? false,
    archived: false,
    new: false,
    featured: data.featured ?? false,
    restricted: false,
    liquidity: data.liquidity || 0,
    volume: data.volume || 0,
    openInterest: 0,
    category: data.category || '',
    published_at: '',
    createdAt: '',
    updatedAt: '',
    competitive: 0,
    volume24hr: 0,
    volume1wk: 0,
    volume1mo: 0,
    volume1yr: 0,
    liquidityAmm: 0,
    liquidityClob: 0,
    commentCount: data.comments_count || 0,
    markets: ((data.markets || []) as DbPolymarketMarket[]).map((m) => ({
      id: m.id,
      question: m.question || '',
      outcomes: m.outcomes || [],
      outcomePrices: m.outcome_prices || [],
      volume: String(m.volume || 0),
      volumeNum: m.volume || 0,
      liquidity: String(m.liquidity || 0),
      liquidityNum: m.liquidity || 0,
      active: m.active ?? true,
      closed: m.closed ?? false,
      clobTokenIds: m.clob_token_ids || [],
      bestBid: m.best_bid,
      bestAsk: m.best_ask,
    })),
    series: [],
    tags: [],
    cyom: false,
    closedTime: '',
    showAllOutcomes: false,
    showMarketImages: false,
    enableNegRisk: false,
    seriesSlug: '',
    negRiskAugmented: false,
    pendingDeployment: false,
    deploying: false,
  } as PolymarketEvent;

  return {
    ...event,
    _likesCount: data.likes_count || 0,
    _commentsCount: data.comments_count || 0,
  };
}

// Hook for syncing events
export function usePolymarketCacheSync() {
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: syncEventsToCache,
    onSuccess: () => {
      // Invalidate relevant queries after sync
      queryClient.invalidateQueries({ queryKey: ['polymarket'] });
    },
  });

  const syncEvent = useCallback((event: PolymarketEvent) => {
    syncMutation.mutate([event]);
  }, [syncMutation]);

  const syncEvents = useCallback((events: PolymarketEvent[]) => {
    syncMutation.mutate(events);
  }, [syncMutation]);

  return {
    syncEvent,
    syncEvents,
    isSyncing: syncMutation.isPending,
  };
}

// Ensure event exists in cache (create minimal entry if not)
export async function ensureEventInCache(eventId: string, title?: string): Promise<void> {
  const { data } = await polymarketClient
    .from('events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();

  if (!data) {
    // Create minimal event entry
    await polymarketClient
      .from('events')
      .insert({
        id: eventId,
        title: title || 'Unknown Event',
        likes_count: 0,
        comments_count: 0,
      });
  }
}
