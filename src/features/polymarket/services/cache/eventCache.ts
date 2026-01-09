/**
 * Smart cache for Polymarket events to avoid redundant transformations
 * and improve fetching performance
 */

import { PolymarketEvent } from '../../types/events';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PolymarketEventCache {
  private eventCache = new Map<string, CacheEntry<PolymarketEvent>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a cached event by ID
   */
  get(eventId: string): PolymarketEvent | null {
    const entry = this.eventCache.get(eventId);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.eventCache.delete(eventId);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Cache an event
   */
  set(event: PolymarketEvent): void {
    this.eventCache.set(event.id, {
      data: event,
      timestamp: Date.now(),
    });
  }

  /**
   * Cache multiple events at once
   */
  setMany(events: PolymarketEvent[]): void {
    const now = Date.now();
    for (const event of events) {
      this.eventCache.set(event.id, {
        data: event,
        timestamp: now,
      });
    }
  }

  /**
   * Invalidate a specific event
   */
  invalidate(eventId: string): void {
    this.eventCache.delete(eventId);
  }

  /**
   * Invalidate all cached events
   */
  invalidateAll(): void {
    this.eventCache.clear();
  }

  /**
   * Update specific fields of a cached event (for realtime updates)
   */
  updatePartial(eventId: string, updates: Partial<PolymarketEvent>): void {
    const entry = this.eventCache.get(eventId);
    if (!entry) return;
    
    this.eventCache.set(eventId, {
      data: { ...entry.data, ...updates },
      timestamp: Date.now(),
    });
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; oldestEntry: number | null } {
    let oldestTimestamp: number | null = null;
    
    for (const entry of this.eventCache.values()) {
      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }
    
    return {
      size: this.eventCache.size,
      oldestEntry: oldestTimestamp ? Date.now() - oldestTimestamp : null,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.eventCache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.eventCache.delete(key);
      }
    }
  }
}

// Singleton instance
export const polymarketEventCache = new PolymarketEventCache();
