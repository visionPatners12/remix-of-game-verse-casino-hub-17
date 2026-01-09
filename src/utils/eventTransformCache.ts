import { EventDetail, NormalizedMarket } from '@/types/oddsFormat';

// Centralized cache management for event transformations
class EventTransformCache {
  private transformCache = new Map<string, EventDetail>();
  private marketCache = new Map<string, NormalizedMarket>();
  private readonly maxCacheSize = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      if (this.transformCache.size > this.maxCacheSize * 0.8) {
        this.clearCache();
      }
    }, 300000);
  }

  generateEventCacheKey(eventId: string, marketsLength: number, volume: number): string {
    return `${eventId}-${marketsLength}-${volume}`;
  }

  generateMarketCacheKey(marketId: string, outcomes: string, outcomePrices: string): string {
    return `${marketId}-${outcomes}-${outcomePrices}`;
  }

  getEvent(key: string): EventDetail | undefined {
    return this.transformCache.get(key);
  }

  setEvent(key: string, value: EventDetail): void {
    if (this.transformCache.size >= this.maxCacheSize) {
      const firstKey = this.transformCache.keys().next().value;
      this.transformCache.delete(firstKey);
    }
    this.transformCache.set(key, value);
  }

  getMarket(key: string): NormalizedMarket | undefined {
    return this.marketCache.get(key);
  }

  setMarket(key: string, value: NormalizedMarket): void {
    if (this.marketCache.size >= this.maxCacheSize) {
      const firstKey = this.marketCache.keys().next().value;
      this.marketCache.delete(firstKey);
    }
    this.marketCache.set(key, value);
  }

  clearCache(): void {
    this.transformCache.clear();
    this.marketCache.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearCache();
  }

  getCacheStats() {
    return {
      eventCacheSize: this.transformCache.size,
      marketCacheSize: this.marketCache.size
    };
  }
}

export const eventTransformCache = new EventTransformCache();