import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FootballApiLeague } from '@/types/footballApi';

interface CompetitionSelectorProps {
  selectedLeague: FootballApiLeague | null;
  availableLeagues: FootballApiLeague[];
  onLeagueChange: (leagueId: string) => void;
  showAllButton?: boolean;
}

export function CompetitionSelector({ 
  selectedLeague, 
  availableLeagues, 
  onLeagueChange,
  showAllButton = true
}: CompetitionSelectorProps) {
  if (availableLeagues.length === 0) return null;

  return (
    <div className="bg-background px-4 py-2 border-b border-border">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {showAllButton && (
          <Badge
            variant={selectedLeague === null ? "default" : "secondary"}
            className={`
              shrink-0 cursor-pointer transition-colors duration-200 px-3 py-1.5
              ${selectedLeague === null 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
            onClick={() => onLeagueChange('')}
          >
            <span className="text-xs font-medium">All</span>
          </Badge>
        )}
        {availableLeagues.map((league) => {
          const isSelected = selectedLeague?.id === league.id;
          
          return (
            <Badge
              key={league.id}
              variant={isSelected ? "default" : "secondary"}
              className={`
                shrink-0 cursor-pointer transition-colors duration-200 px-3 py-1.5
                ${isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
              onClick={() => onLeagueChange(league.id.toString())}
            >
              <div className="flex items-center gap-1.5">
                <img 
                  src={league.logo} 
                  alt={league.name}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium">{league.name}</span>
              </div>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}