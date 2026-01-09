import React from 'react';
import { cn } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui';
import * as LucideIcons from 'lucide-react';
import type { SearchTeam } from '../types';

interface TeamSearchResultsProps {
  results: SearchTeam[];
  query: string;
  isLoading?: boolean;
  onTeamClick?: (team: SearchTeam) => void;
  maxResults?: number;
  className?: string;
}

const TeamSearchResults = React.memo<TeamSearchResultsProps>(({
  results,
  query,
  isLoading = false,
  onTeamClick,
  maxResults,
  className
}) => {
  const displayResults = maxResults ? results.slice(0, maxResults) : results;
  const remainingCount = maxResults && results.length > maxResults ? results.length - maxResults : 0;

  const handleTeamClick = (team: SearchTeam) => {
    onTeamClick?.(team);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayResults.length === 0 && query) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">No teams found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-border", className)}>
      {displayResults.map((team) => (
        <div
          key={team.id}
          onClick={() => handleTeamClick(team)}
          className="flex items-center gap-3 px-4 py-3 active:bg-accent/50 transition-colors cursor-pointer"
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={team.logo || undefined} alt={team.name} />
            <AvatarFallback className="text-xs font-medium">
              {team.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {team.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {team.sport_icon && (() => {
                const IconComponent = (LucideIcons as any)[team.sport_icon];
                return IconComponent ? <IconComponent className="w-3.5 h-3.5" /> : null;
              })()}
              <span>{team.sport_name}</span>
              {team.country_name && (
                <>
                  <span>•</span>
                  <span>{team.country_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            +{remainingCount} more team{remainingCount > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
});

TeamSearchResults.displayName = 'TeamSearchResults';

export { TeamSearchResults };