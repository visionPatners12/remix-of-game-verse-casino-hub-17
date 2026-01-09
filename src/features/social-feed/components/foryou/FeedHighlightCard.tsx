// Feed Highlight Card - Displays highlight content in the hybrid feed
import React, { memo, useState, useMemo } from 'react';
import { Play, Zap, Clock } from 'lucide-react';
import type { PersonalizedHighlight } from '@/features/highlights/hooks/usePersonalizedHighlights';
import { VideoPlayerDialog } from '@/features/highlights/components/VideoPlayerDialog';
import { parseHighlightScore, type HighlightMatchScore } from '@/features/highlights/utils/parseScore';

interface FeedHighlightCardProps {
  highlight: PersonalizedHighlight;
}

export const FeedHighlightCard = memo(function FeedHighlightCard({ highlight }: FeedHighlightCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  
  const thumbnailUrl = highlight.image_url || '';
  const duration = highlight.duration_seconds 
    ? `${Math.floor(highlight.duration_seconds / 60)}:${(highlight.duration_seconds % 60).toString().padStart(2, '0')}`
    : null;
  
  const score = useMemo(() => parseHighlightScore(highlight.match?.score as HighlightMatchScore), [highlight.match]);

  const handlePlay = () => {
    if (highlight.video_url || highlight.embed_url) {
      setShowVideo(true);
    }
  };

  return (
    <>
      <div 
        className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
        onClick={handlePlay}
      >
        {/* Header with highlight badge */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-border/50">
          {/* Left: Badge + League */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold">
              <Zap className="h-3 w-3" />
              Highlight
            </span>
            {highlight.league && (
              <span className="text-xs text-muted-foreground">
                {highlight.league.name}
              </span>
            )}
          </div>
          
          {/* Right: Stage / Round */}
          {(highlight.match?.stage || highlight.match?.round) && (
            <span className="text-xs text-muted-foreground">
              {highlight.match.stage}
              {highlight.match.stage && highlight.match.round && ' • '}
              {highlight.match.round}
            </span>
          )}
        </div>

        {/* Teams display */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Home team */}
          <div className="flex items-center gap-2 flex-1">
            {highlight.home_team?.logo && (
              <img 
                src={highlight.home_team.logo} 
                alt={highlight.home_team.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="text-sm font-medium truncate">
              {highlight.home_team?.name || 'Home'}
            </span>
          </div>

          {/* Score or VS */}
          {score.home !== null && score.away !== null ? (
            <div className="px-3 flex items-center gap-1">
              <span className="text-lg font-bold">{score.home}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-lg font-bold">{score.away}</span>
            </div>
          ) : (
            <div className="px-3 text-xs text-muted-foreground">VS</div>
          )}

          {/* Away team */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-medium truncate text-right">
              {highlight.away_team?.name || 'Away'}
            </span>
            {highlight.away_team?.logo && (
              <img 
                src={highlight.away_team.logo} 
                alt={highlight.away_team.name}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
        </div>

        {/* Thumbnail with play overlay */}
        {thumbnailUrl && (
          <div className="relative aspect-video bg-muted">
            <img 
              src={thumbnailUrl} 
              alt={highlight.title || 'Highlight'}
              className="w-full h-full object-cover"
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <Play className="h-6 w-6 text-primary-foreground fill-current ml-0.5" />
              </div>
            </div>

            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                <Clock className="h-3 w-3" />
                {duration}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        {highlight.title && (
          <div className="px-4 py-3 border-t border-border/50">
            <p className="text-sm font-medium line-clamp-2">{highlight.title}</p>
          </div>
        )}
      </div>

      {/* Video player dialog */}
      <VideoPlayerDialog
        highlight={highlight}
        open={showVideo}
        onOpenChange={setShowVideo}
      />
    </>
  );
});

FeedHighlightCard.displayName = 'FeedHighlightCard';
