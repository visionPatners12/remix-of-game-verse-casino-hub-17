import React from 'react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getEventConfig } from '@/types/live-events/football';
import type { PostComponentProps } from '@/types/feed/registry';
import type { LiveEventPost } from '@/types/feed/post';

export function LiveEventPostComponent(props: PostComponentProps<LiveEventPost>) {
  const { post } = props;
  const event = post.liveEventContent;
  const navigate = useNavigate();

  if (!event) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  const config = getEventConfig(event.eventType);
  const EventIcon = config.Icon;

  const handlePlayerClick = (playerId?: string) => {
    if (playerId) {
      navigate(`/player/${playerId}`);
    }
  };

  const handleMatchClick = () => {
    if (event.match.id) {
      navigate(`/match/unknown/unknown/unknown/${event.match.id}`);
    }
  };

  // Générer le texte descriptif de l'événement
  const getEventDescription = () => {
    switch (event.eventType) {
      case 'Goal':
      case 'Penalty':
        return event.assistingPlayer?.name 
          ? `${event.player.name} (passe de ${event.assistingPlayer.name})`
          : event.player.name;
      case 'Own Goal':
        return `${event.player.name} (CSC)`;
      case 'Substitution':
        return (
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-green-500">↑ {event.player.name}</span>
            <span className="text-red-500">↓ {event.substitutedPlayer?.name}</span>
          </span>
        );
      default:
        return event.player.name;
    }
  };

  return (
    <BasePost {...props}>
      <Card className={`transition-all duration-300 relative overflow-hidden border-l-4 ${config.color.replace('text-', 'border-l-')}`}>
        <div className="p-3 space-y-3">
          
          {/* Event header avec badge */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
              <EventIcon className={`h-4 w-4 ${config.color} ${config.fillColor || ''}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-mono font-bold">{event.eventTime}'</span>
            </div>
          </div>

          {/* Match info bar */}
          <div 
            className="flex items-center justify-between bg-muted/30 rounded-lg p-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleMatchClick}
          >
            {/* Home team */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {event.match.homeTeamLogo && (
                <img src={event.match.homeTeamLogo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{event.match.homeTeam}</span>
            </div>
            
            {/* Score */}
            {event.match.score && (
              <div className="text-sm font-bold px-3 flex-shrink-0">
                {event.match.score.home} - {event.match.score.away}
              </div>
            )}
            
            {/* Away team */}
            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <span className="text-xs font-medium truncate">{event.match.awayTeam}</span>
              {event.match.awayTeamLogo && (
                <img src={event.match.awayTeamLogo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Event details - Team & Player */}
          <div className="flex items-center gap-3">
            {/* Team logo */}
            {event.team.logo && (
              <img src={event.team.logo} alt={event.team.name} className="w-10 h-10 object-contain flex-shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              {/* Team name */}
              <div className="text-xs text-muted-foreground truncate">{event.team.name}</div>
              
              {/* Player info - clickable */}
              <div 
                className={`text-sm font-semibold ${event.player.id ? 'cursor-pointer hover:text-primary' : ''}`}
                onClick={() => handlePlayerClick(event.player.id)}
              >
                {getEventDescription()}
              </div>
            </div>
          </div>

          {/* League info */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {event.match.leagueLogo && (
              <img src={event.match.leagueLogo} alt="" className="w-4 h-4 object-contain" />
            )}
            <span className="text-xs text-muted-foreground truncate">{event.match.league}</span>
          </div>

          {/* Optional content/comment */}
          {post.content && (
            <div className="text-sm text-foreground leading-relaxed pt-2">
              {post.content}
            </div>
          )}
        </div>
      </Card>
    </BasePost>
  );
}

LiveEventPostComponent.displayName = 'LiveEventPostComponent';
