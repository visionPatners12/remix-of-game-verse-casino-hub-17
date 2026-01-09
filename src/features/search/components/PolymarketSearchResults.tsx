import React from 'react';
import { cn } from '@/utils';
import { Badge } from '@/ui';
import { TrendingUp, ChevronRight } from 'lucide-react';
import type { PolymarketEventSearchResult, PolymarketTagSearchResult } from '../types/polymarket';

interface PolymarketSearchResultsProps {
  results: PolymarketEventSearchResult[];
  matchingTags?: PolymarketTagSearchResult[];
  tagsCount?: number;
  query: string;
  isLoading: boolean;
  onEventClick?: (event: PolymarketEventSearchResult) => void;
  onTagClick?: (tag: PolymarketTagSearchResult) => void;
  className?: string;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(0)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

export const PolymarketSearchResults = React.memo<PolymarketSearchResultsProps>(({
  results,
  matchingTags = [],
  tagsCount = 0,
  query,
  isLoading,
  onEventClick,
  onTagClick,
  className
}) => {
  if (isLoading && results.length === 0) {
    return (
      <div className="divide-y divide-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tagsCount === 0 && results.length === 0) {
    return null;
  }

  return (
    <div className={cn("divide-y divide-border", className)}>
      {/* Matching tags section */}
      {tagsCount > 0 && (
        <div className="px-4 py-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {tagsCount} tag{tagsCount > 1 ? 's' : ''}
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {matchingTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                onClick={() => onTagClick?.(tag)}
                className="cursor-pointer hover:bg-accent transition-colors"
              >
                #{tag.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Events list - native style */}
      {results.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className="flex items-center gap-3 px-4 py-3 active:bg-muted/50 cursor-pointer transition-colors"
        >
          {/* Event icon/image */}
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
            {event.icon || event.image ? (
              <img
                src={event.icon || event.image || ''}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Event info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2 text-foreground">
              {event.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {event.tag_label && (
                <span className="text-xs text-muted-foreground">#{event.tag_label}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatVolume(event.volume)}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      ))}
    </div>
  );
});

PolymarketSearchResults.displayName = 'PolymarketSearchResults';
