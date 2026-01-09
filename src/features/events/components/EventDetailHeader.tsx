import React from 'react';
import { EventDetail } from '@/types/oddsFormat';
import { formatVolume, formatEndDate } from '@/utils/oddsCalculators';
import { MessageCircle, TrendingUp, Droplets, Calendar } from 'lucide-react';
import { PolymarketTagBadge, PolymarketTag } from '@/features/polymarket/components/ui/PolymarketTagBadge';

interface EventDetailHeaderProps {
  event: EventDetail;
  tags?: PolymarketTag[];
}

export const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({ event, tags }) => {
  return (
    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Image/icon à gauche */}
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-xl border-2 border-dashed flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 opacity-50" />
        </div>
      )}

      {/* Bloc texte à droite */}
      <div className="flex-1 min-w-0">
        {/* Titre */}
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
          {event.title}
        </h1>

        {/* Description */}
        {event.description && (
          <p className="text-xs sm:text-sm md:text-base leading-snug line-clamp-2 sm:line-clamp-1 mt-1 opacity-80">
            {event.description}
          </p>
        )}

        {/* Ligne métriques */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm">
          <div className="inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formatVolume(event.volume)}</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formatVolume(event.liquidity)}</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{formatEndDate(event.endDate)}</span>
            <span className="sm:hidden">{formatEndDate(event.endDate).replace(/\//g, '/')}</span>
          </div>
          {event.commentCount !== undefined && event.commentCount > 0 && (
            <div className="inline-flex items-center gap-1">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{event.commentCount}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map(tag => (
              <PolymarketTagBadge 
                key={tag.id} 
                tag={tag}
                variant="outline"
              />
            ))}
            {tags.length > 5 && (
              <span className="text-xs text-muted-foreground self-center">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};