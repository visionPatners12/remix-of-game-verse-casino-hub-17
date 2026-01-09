import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getEventConfig } from '@/types/live-events/football';
import type { MatchEvent } from '../hooks/useMatchData';

interface MatchEventCardProps {
  event: MatchEvent;
  playerIdMap?: Map<number, string>; // providerId -> UUID map
}

export const MatchEventCard = memo(function MatchEventCard({ event, playerIdMap }: MatchEventCardProps) {
  const navigate = useNavigate();
  const config = getEventConfig(event.eventType);
  const EventIcon = config.Icon;

  const handlePlayerClick = (providerId?: number, existingId?: string | null) => {
    // First try existing UUID from event
    if (existingId) {
      navigate(`/player/${existingId}`);
      return;
    }
    // Then try lookup by providerId
    if (providerId && playerIdMap) {
      const playerId = playerIdMap.get(providerId);
      if (playerId) {
        navigate(`/player/${playerId}`);
      }
    }
  };

  const isSubstitution = event.eventType === 'Substitution';
  
  // Check if player has a link
  const hasPlayerLink = event.player.id || (event.player.providerId && playerIdMap?.has(event.player.providerId));

  return (
    <div className="flex items-start gap-3 py-3 px-4">
      {/* Time badge */}
      <div className="flex items-center gap-1 text-muted-foreground min-w-[45px] pt-0.5">
        <Clock className="h-3 w-3" />
        <span className="text-xs font-mono font-bold">{event.eventTime}'</span>
      </div>

      {/* Colored indicator bar */}
      <div className={`w-1 self-stretch rounded-full ${config.bgColor}`} />

      {/* Event icon */}
      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${config.bgColor} flex-shrink-0`}>
        <EventIcon className={`h-3.5 w-3.5 ${config.color} ${config.fillColor || ''}`} />
      </div>

      {/* Team logo */}
      {event.team.logo && (
        <img 
          src={event.team.logo} 
          alt={event.team.name} 
          className="w-5 h-5 object-contain flex-shrink-0" 
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isSubstitution ? (
          // Substitution: two lines for in/out players
          <div className="space-y-1">
            <div 
              className={`flex items-center gap-2 text-sm ${hasPlayerLink ? 'cursor-pointer hover:text-primary' : ''}`}
              onClick={() => handlePlayerClick(event.player.providerId, event.player.id)}
            >
              <span className="text-green-500 font-medium">↑</span>
              <span className={`truncate ${hasPlayerLink ? 'text-primary' : ''}`}>{event.player.name}</span>
            </div>
            {event.substitutedPlayer && (
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="text-red-500 font-medium">↓</span>
                <span className="truncate">{event.substitutedPlayer.name}</span>
              </div>
            )}
          </div>
        ) : (
          // Other events: single line
          <div 
            className={`text-sm ${hasPlayerLink ? 'cursor-pointer hover:text-primary' : ''}`}
            onClick={() => handlePlayerClick(event.player.providerId, event.player.id)}
          >
            <span className={`font-medium ${hasPlayerLink ? 'text-primary' : ''}`}>{event.player.name}</span>
            {event.eventType === 'Goal' && event.assistingPlayer?.name && (
              <span className="text-muted-foreground ml-1">
                (assist: {event.assistingPlayer.name})
              </span>
            )}
            {event.eventType === 'Own Goal' && (
              <span className="text-muted-foreground ml-1">(OG)</span>
            )}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">
          {event.team.name}
        </div>
      </div>

      {/* Event type label */}
      <span className={`text-[10px] font-bold uppercase ${config.color} flex-shrink-0`}>
        {config.label}
      </span>
    </div>
  );
});
