import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface BasketballEvent {
  id?: string;
  team?: {
    id?: string;
    name?: string;
    abbreviation?: string;
    logo?: string;
  } | null;
  clock?: string;
  period?: number;
  description?: string;
  isScoringPlay?: boolean;
  isShootingPlay?: boolean;
}

interface BasketballEventCardProps {
  event: BasketballEvent;
  index: number;
}

// Get period label
function getPeriodLabel(period: number | undefined): string {
  if (!period) return '';
  if (period <= 4) return `Q${period}`;
  return `OT${period - 4}`;
}

export const BasketballEventCard = memo(function BasketballEventCard({ 
  event, 
  index 
}: BasketballEventCardProps) {
  const { team, clock, period, description, isScoringPlay, isShootingPlay } = event;

  return (
    <div 
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors",
        isScoringPlay && "bg-green-500/5"
      )}
    >
      {/* Period & Clock */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-[10px] font-medium text-muted-foreground uppercase">
          {getPeriodLabel(period)}
        </span>
        {clock && (
          <span className="text-xs font-mono text-foreground">
            {clock}
          </span>
        )}
      </div>

      {/* Team Logo */}
      <div className="flex-shrink-0 w-8 h-8">
        {team?.logo ? (
          <img 
            src={team.logo} 
            alt={team.name || ''} 
            className="w-8 h-8 object-contain"
          />
        ) : team?.abbreviation ? (
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
            <span className="text-[10px] font-bold text-muted-foreground">
              {team.abbreviation}
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded bg-muted/50" />
        )}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm text-foreground",
          isScoringPlay && "font-medium"
        )}>
          {description || 'Play'}
        </p>
        {team?.name && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {team.name}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col items-end gap-1">
        {isScoringPlay && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">
            SCORE
          </span>
        )}
        {isShootingPlay && !isScoringPlay && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            SHOT
          </span>
        )}
      </div>
    </div>
  );
});
