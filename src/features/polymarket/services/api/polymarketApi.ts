import { supabase } from '@/integrations/supabase/client';
import { PolymarketEvent } from '../../types/events';
import { PolymarketFeedRequest, PolymarketFeedResponse, PolymarketTab } from '../../types/feed';
import { polymarketDbService } from './polymarketDbService';
import { parseOutcomes, parseOutcomePrices } from '../../utils/helpers';

export const polymarketService = {
  // New unified feed endpoint
  async fetchFeed(request: PolymarketFeedRequest = {}): Promise<PolymarketFeedResponse> {
    const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
      body: request
    });

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'Failed to fetch feed');
    
    return data;
  },

  // Fetch events by tab (trending, new, breaking)
  async fetchEventsByTab(tab: PolymarketTab, limit = 40, offset = 0): Promise<PolymarketFeedResponse> {
    return this.fetchFeed({ tab, limit, offset });
  },

  // Fetch events by category with subcategories
  async fetchEventsByCategory(
    categorySlug: string, 
    options: { includeSubcategories?: boolean; limit?: number; offset?: number } = {}
  ): Promise<PolymarketFeedResponse> {
    return this.fetchFeed({
      tab: 'category',
      categorySlug,
      includeSubcategories: options.includeSubcategories ?? true,
      limit: options.limit ?? 40,
      offset: options.offset ?? 0
    });
  },

  // Fetch events by subcategory
  async fetchEventsBySubcategory(
    categorySlug: string,
    subSlug: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<PolymarketFeedResponse> {
    return this.fetchFeed({
      tab: 'subcategory',
      categorySlug,
      subSlug,
      limit: options.limit ?? 40,
      offset: options.offset ?? 0
    });
  },

  // Legacy: Fetch all active events (uses trending tab)
  async fetchAllEvents(): Promise<PolymarketEvent[]> {
    const response = await this.fetchFeed({ tab: 'trending', limit: 50 });
    return response.data;
  },

  // Fetch single event by ID from database
  // Returns event data AND CLOB prices for accurate buy/sell display
  async fetchEventById(eventId: string): Promise<{ 
    event: PolymarketEvent; 
    clobPrices: Record<string, string | number> | null 
  }> {
    // Fetch from database instead of Gamma API
    const event = await polymarketDbService.fetchEventById(eventId);
    
    // Build CLOB prices from market data
    const clobPrices: Record<string, string | number> = {};
    
    for (const market of event.markets) {
      try {
        const prices = parseOutcomePrices(market.outcomePrices);
        let tokenIds: string[] = [];
        
        // Handle both string and array formats for clobTokenIds
        if (typeof market.clobTokenIds === 'string') {
          tokenIds = JSON.parse(market.clobTokenIds);
        } else if (Array.isArray(market.clobTokenIds)) {
          tokenIds = market.clobTokenIds;
        }
        
        // Map token IDs to prices
        tokenIds.forEach((tokenId: string, idx: number) => {
          if (tokenId && prices[idx]) {
            const price = parseFloat(prices[idx]);
            if (!isNaN(price) && price > 0) {
              clobPrices[`${tokenId}:BUY`] = price;
            }
          }
        });
      } catch (e) {
        console.warn('[fetchEventById] Error parsing market:', market.id, e);
      }
    }
    
    return {
      event,
      clobPrices: Object.keys(clobPrices).length > 0 ? clobPrices : null
    };
  },
};
