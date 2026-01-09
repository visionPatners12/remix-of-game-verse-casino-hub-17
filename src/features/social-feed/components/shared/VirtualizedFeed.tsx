// VirtualizedFeed - High-performance feed using react-window
// Renders only visible items for optimal performance with large feeds

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import type { ListChildComponentProps } from 'react-window';

interface VirtualizedFeedProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemHeight: (item: T, index: number) => number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  containerHeight?: number;
  overscanCount?: number;
}

// Default item heights based on content type
export const FEED_ITEM_HEIGHTS = {
  streamPost: 320,
  streamPostWithImage: 480,
  streamPostWithGif: 400,
  match: 200,
  highlight: 400,
  prediction: 380,
  bet: 350,
  opinion: 300,
  loading: 80,
} as const;

function VirtualizedFeedInner<T>({
  items,
  renderItem,
  getItemHeight,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  containerHeight,
  overscanCount = 3,
}: VirtualizedFeedProps<T>) {
  const listRef = useRef<List>(null);
  const heightCache = useRef<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate container height dynamically
  const calculatedHeight = containerHeight || (typeof window !== 'undefined' ? window.innerHeight - 120 : 600);

  // Get height for an item (with caching)
  const getHeight = useCallback(
    (index: number): number => {
      if (heightCache.current.has(index)) {
        return heightCache.current.get(index)!;
      }
      
      const item = items[index];
      if (!item) return FEED_ITEM_HEIGHTS.loading;
      
      const height = getItemHeight(item, index);
      heightCache.current.set(index, height);
      return height;
    },
    [items, getItemHeight]
  );

  // Reset height cache when items change
  useEffect(() => {
    heightCache.current.clear();
    listRef.current?.resetAfterIndex(0);
  }, [items.length]);

  // Handle scroll to detect when to load more
  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }: { visibleStopIndex: number }) => {
      if (hasMore && !isLoading && visibleStopIndex >= items.length - 3) {
        onLoadMore?.();
      }
    },
    [hasMore, isLoading, items.length, onLoadMore]
  );

  // Row renderer
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const item = items[index];
      if (!item) return null;

      return (
        <div style={style}>
          <div className="px-2">
            {renderItem(item, index)}
          </div>
        </div>
      );
    },
    [items, renderItem]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full">
      <List
        ref={listRef}
        height={calculatedHeight}
        itemCount={items.length}
        itemSize={getHeight}
        width="100%"
        overscanCount={overscanCount}
        onItemsRendered={handleItemsRendered}
        className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      >
        {Row}
      </List>
    </div>
  );
}

export const VirtualizedFeed = memo(VirtualizedFeedInner) as typeof VirtualizedFeedInner;

// Helper hook to estimate item heights based on content
export function useItemHeightEstimator() {
  return useCallback((item: { type?: string; hasMedia?: boolean; hasGif?: boolean }) => {
    const type = item.type || 'stream';
    
    switch (type) {
      case 'match':
        return FEED_ITEM_HEIGHTS.match;
      case 'highlight':
        return FEED_ITEM_HEIGHTS.highlight;
      case 'stream':
      default:
        if (item.hasGif) return FEED_ITEM_HEIGHTS.streamPostWithGif;
        if (item.hasMedia) return FEED_ITEM_HEIGHTS.streamPostWithImage;
        return FEED_ITEM_HEIGHTS.streamPost;
    }
  }, []);
}
