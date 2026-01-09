import React, { memo, useMemo } from 'react';
import { Radio, Loader2, AlertCircle } from 'lucide-react';
import { useMatchData } from '../hooks/useMatchData';
import { MatchEventCard } from './MatchEventCard';
import { AFEventCard } from './AFEventCard';
import { BasketballEventCard } from './BasketballEventCard';
import { BaseballEventCard } from './BaseballEventCard';
import { HockeyEventCard } from './HockeyEventCard';

interface MatchEventsSectionProps {
  matchId: string;
  sportSlug?: string;
}

export const MatchEventsSection = memo(function MatchEventsSection({ matchId, sportSlug }: MatchEventsSectionProps) {
  const { data, isLoading, error } = useMatchData(matchId);
  
  const isAmericanFootball = useMemo(() => 
    sportSlug === 'american-football', [sportSlug]
  );
  
  const isBasketball = useMemo(() => 
    sportSlug === 'basketball', [sportSlug]
  );
  
  const isBaseball = useMemo(() => 
    sportSlug === 'baseball', [sportSlug]
  );
  
  const isHockey = useMemo(() => 
    sportSlug === 'ice-hockey' || sportSlug === 'hockey', [sportSlug]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">Unable to load events</p>
      </div>
    );
  }

  const events = data?.events || [];

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No events</h3>
        <p className="text-sm">
          {isHockey 
            ? 'Shots, goals and penalties will appear here'
            : 'Goals, cards and substitutions will appear here'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/20">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="font-semibold text-sm">Match events</span>
        <span className="text-xs text-muted-foreground">
          {events.length} event{events.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Events list with dividers */}
      <div className="divide-y divide-border/20">
        {isAmericanFootball ? (
          events.map((event, index) => (
            <AFEventCard key={event.id || index} event={event} index={index} />
          ))
        ) : isBasketball ? (
          events.map((event, index) => (
            <BasketballEventCard key={event.id || index} event={event} index={index} />
          ))
        ) : isBaseball ? (
          events.map((event, index) => (
            <BaseballEventCard key={event.id || index} event={event} index={index} />
          ))
        ) : isHockey ? (
          events.map((event, index) => (
            <HockeyEventCard key={event.id || index} event={event} index={index} />
          ))
        ) : (
          events.map((event, index) => (
            <MatchEventCard key={event.id || index} event={event} />
          ))
        )}
      </div>
    </div>
  );
});
