import React, { memo } from 'react';
import { MdSportsFootball } from 'react-icons/md';
import { Target, RotateCcw, ArrowRight } from 'lucide-react';

interface AFDriveEvent {
  eventType: string;
  team: {
    name: string;
    logo?: string;
    abbreviation?: string;
    providerId?: number;
  };
  start?: {
    clock?: string;
    period?: string;
    yardLine?: number;
  };
  end?: {
    clock?: string;
    period?: string;
    yardLine?: number;
  };
  description?: string;
  plays?: string[];
  isScoringPlay?: boolean;
}

interface AFEventCardProps {
  event: AFDriveEvent;
  index: number;
}

const getEventIcon = (eventType: string) => {
  const e = eventType.toLowerCase();
  if (e.includes('touchdown')) return <MdSportsFootball className="h-4 w-4 text-green-500" />;
  if (e.includes('field goal')) return <Target className="h-4 w-4 text-amber-500" />;
  if (e.includes('punt') || e.includes('turnover')) return <RotateCcw className="h-4 w-4 text-muted-foreground" />;
  return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
};

const getEventColor = (eventType: string): string => {
  const e = eventType.toLowerCase();
  if (e.includes('touchdown')) return 'bg-green-500/10 text-green-500 border-green-500/20';
  if (e.includes('field goal')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (e.includes('turnover') || e.includes('interception') || e.includes('fumble')) {
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }
  return 'bg-muted text-muted-foreground border-border';
};

export const AFEventCard = memo(function AFEventCard({ event, index }: AFEventCardProps) {
  const { eventType, team, start, end, description, isScoringPlay } = event;

  return (
    <div className={`py-3 ${isScoringPlay ? 'bg-green-500/5' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Team Logo */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {team?.logo ? (
            <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
          ) : (
            <MdSportsFootball className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Event Type Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${getEventColor(eventType)}`}>
              {getEventIcon(eventType)}
              {eventType}
            </span>
            
            {/* Scoring indicator */}
            {isScoringPlay && (
              <span className="text-xs font-medium text-green-500">SCORE</span>
            )}
          </div>

          {/* Team Name + Abbreviation */}
          <div className="text-sm font-medium mb-1">
            {team?.name}
            {team?.abbreviation && <span className="text-muted-foreground ml-1">({team.abbreviation})</span>}
          </div>

          {/* Yard Line Progress */}
          {(start?.yardLine !== undefined || end?.yardLine !== undefined) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              {start?.yardLine !== undefined && (
                <span>Start: {start.yardLine} yd</span>
              )}
              {start?.yardLine !== undefined && end?.yardLine !== undefined && (
                <ArrowRight className="h-3 w-3" />
              )}
              {end?.yardLine !== undefined && (
                <span>End: {end.yardLine} yd</span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="text-xs text-muted-foreground">
              {description}
            </div>
          )}

          {/* Period/Clock - period is now a string like "1st Quarter" */}
          {start?.period && (
            <div className="text-xs text-muted-foreground mt-1">
              {start.period} {start.clock && `• ${start.clock}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
