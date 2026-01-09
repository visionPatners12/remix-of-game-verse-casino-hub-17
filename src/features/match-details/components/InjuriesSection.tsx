import React, { memo } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { MatchDataResponse } from '../hooks/useMatchData';

interface InjuriesSectionProps {
  match: SupabaseMatchData;
  matchData: MatchDataResponse | null | undefined;
  isLoading?: boolean;
}

interface InjuredPlayer {
  playerName?: string;
  jerseyNumber?: string | number;
  position?: string;
  status?: string;
}

interface TeamInjuries {
  name: string;
  logo?: string;
  injuries: InjuredPlayer[];
}

const getStatusColor = (status: string): string => {
  const s = status?.toLowerCase() || '';
  if (s.includes('out') || s.includes('ir')) return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s.includes('doubtful')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  if (s.includes('questionable')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (s.includes('probable')) return 'bg-green-500/10 text-green-500 border-green-500/20';
  return 'bg-muted text-muted-foreground border-border';
};

// Removed emoji status icons

const TeamInjuriesCard = memo(function TeamInjuriesCard({ team }: { team: TeamInjuries }) {
  if (!team.injuries || team.injuries.length === 0) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-2 mb-3">
          {team.logo && (
            <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
          )}
          <span className="font-medium">{team.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">No injuries reported</div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-3">
        {team.logo && (
          <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
        )}
        <span className="font-medium">{team.name}</span>
        <span className="text-xs text-muted-foreground">({team.injuries.length})</span>
      </div>
      
      <div className="space-y-2">
        {team.injuries.map((player, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
            <div>
              <div className="text-sm font-medium">
                {player.jerseyNumber && <span className="text-muted-foreground mr-1">#{player.jerseyNumber}</span>}
                {player.playerName}
              </div>
              {player.position && (
                <div className="text-xs text-muted-foreground">{player.position}</div>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(player.status || '')}`}>
              {player.status || 'Unknown'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const InjuriesSection = memo(function InjuriesSection({ 
  match, 
  matchData,
  isLoading 
}: InjuriesSectionProps) {
  const injuries = matchData?.injuries as { homeTeam?: TeamInjuries; awayTeam?: TeamInjuries } | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!injuries || (!injuries.homeTeam && !injuries.awayTeam)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <div>Injury report not available</div>
      </div>
    );
  }

  const homeTeam: TeamInjuries = injuries.homeTeam || {
    name: match.home_team?.name || 'Home',
    logo: match.home_team?.logo,
    injuries: [],
  };

  const awayTeam: TeamInjuries = injuries.awayTeam || {
    name: match.away_team?.name || 'Away',
    logo: match.away_team?.logo,
    injuries: [],
  };

  return (
    <div className="divide-y divide-border">
      <TeamInjuriesCard team={homeTeam} />
      <TeamInjuriesCard team={awayTeam} />
    </div>
  );
});
