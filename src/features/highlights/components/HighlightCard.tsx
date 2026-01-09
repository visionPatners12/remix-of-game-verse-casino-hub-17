import React from 'react';
import { Play } from 'lucide-react';
import type { Highlight } from '../types';

interface HighlightCardProps {
  highlight: Highlight;
  onPlay?: (highlight: Highlight) => void;
}

export function HighlightCard({ highlight, onPlay }: HighlightCardProps) {
  const thumbnailUrl = highlight.image_url || (highlight.thumbnails?.default as string | undefined);
  const duration = highlight.duration_seconds 
    ? `${Math.floor(highlight.duration_seconds / 60)}:${(highlight.duration_seconds % 60).toString().padStart(2, '0')}`
    : null;

  return (
    <article 
      className="group relative overflow-hidden rounded-lg bg-card border border-border cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={() => onPlay?.(highlight)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl}
            alt={highlight.title || 'Highlight'}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-primary p-3">
            <Play className="h-6 w-6 text-primary-foreground fill-current" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
            {duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {highlight.title || 'Highlight Video'}
        </h3>
        
        {highlight.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {highlight.description}
          </p>
        )}
      </div>
    </article>
  );
}
