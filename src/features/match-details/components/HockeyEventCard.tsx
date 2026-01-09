import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Target, Circle } from 'lucide-react';

interface HockeyEvent {
  id: string;
  eventType: string;
  clock?: string | null;
  period?: number | null;
  isScoringPlay?: boolean;
  team?: {
    providerId?: number;
    name?: string;
    abbreviation?: string;
    logo?: string;
  };
}

interface HockeyEventCardProps {
  event: HockeyEvent;
  index: number;
}

const getPeriodLabel = (period: number | null): string => {
  if (!period) return '';
  if (period === 1) return '1st';
  if (period === 2) return '2nd';
  if (period === 3) return '3rd';
  if (period === 4) return 'OT';
  return `${period}th`;
};

const getEventIcon = (eventType: string, isScoringPlay: boolean) => {
  if (isScoringPlay || eventType.toLowerCase() === 'goal') {
    return <Target className="h-4 w-4 text-green-500" />;
  }
  if (eventType.toLowerCase() === 'shot') {
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground" />;
};

export const HockeyEventCard = memo(function HockeyEventCard({ event, index }: HockeyEventCardProps) {
  const periodLabel = getPeriodLabel(event.period);
  const isGoal = event.isScoringPlay || event.eventType?.toLowerCase() === 'goal';

  return (
    <div className={`flex items-center gap-4 p-4 ${isGoal ? 'bg-green-500/5' : ''}`}>
      {/* Period & Clock */}
      <div className="flex flex-col items-center min-w-[60px]">
        {periodLabel && (
          <Badge variant={isGoal ? "default" : "secondary"} className="text-xs mb-1">
            {periodLabel}
          </Badge>
        )}
        {event.clock && (
          <span className="text-xs text-muted-foreground">{event.clock}</span>
        )}
      </div>

      {/* Event Icon */}
      <div className="flex-shrink-0">
        {getEventIcon(event.eventType, event.isScoringPlay)}
      </div>

      {/* Team */}
      {event.team && (
        <div className="flex items-center gap-2 flex-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.team.logo} alt={event.team.name} />
            <AvatarFallback className="text-xs">{event.team.abbreviation || ''}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{event.team.name}</span>
        </div>
      )}

      {/* Event Type */}
      <div className="text-right">
        <span className={`text-sm ${isGoal ? 'font-semibold text-green-500' : 'text-muted-foreground'}`}>
          {event.eventType}
        </span>
      </div>
    </div>
  );
});
