import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { FootballApiLeague } from '@/types/footballApi';

interface SeasonLeagueSelectorProps {
  season: string;
  selectedLeague: FootballApiLeague | null;
  availableLeagues: FootballApiLeague[];
  onLeagueChange: (leagueId: string) => void;
}

export function SeasonLeagueSelector({ 
  season, 
  selectedLeague, 
  availableLeagues, 
  onLeagueChange 
}: SeasonLeagueSelectorProps) {
  return (
    <div className="bg-primary/5 border-b p-grid-4">
      {/* Season Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {selectedLeague && (
            <img 
              src={selectedLeague.logo} 
              alt={selectedLeague.name}
              className="w-6 h-6 rounded"
            />
          )}
          <div className="text-competitive-subtitle text-foreground font-semibold">
            {selectedLeague?.name || 'Sélectionnez une compétition'} • {season}
          </div>
        </div>
        <Badge variant="outline" className="text-caption">
          <Trophy className="w-3 h-3 mr-1" />
          Saison {season}
        </Badge>
      </div>

      {/* League Selector */}
      {availableLeagues.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-caption text-muted-foreground whitespace-nowrap">
            Compétition:
          </span>
          <Select
            value={selectedLeague?.id.toString() || ''}
            onValueChange={onLeagueChange}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Choisir une compétition" />
            </SelectTrigger>
            <SelectContent>
              {availableLeagues.map((league) => (
                <SelectItem key={league.id} value={league.id.toString()}>
                  <div className="flex items-center gap-2">
                    <img 
                      src={league.logo} 
                      alt={league.name}
                      className="w-4 h-4"
                    />
                    <span className="truncate">{league.name}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {league.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}