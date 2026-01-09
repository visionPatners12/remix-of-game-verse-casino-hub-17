import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { BoxScorePlayerCard } from './BoxScorePlayerCard';
import { LoadingSpinner } from '@/ui';
import { cn } from '@/lib/utils';
import { useMatchBoxScore, type BoxScorePlayer } from '../hooks/useMatchBoxScore';
import { useMatchData } from '../hooks/useMatchData';
import { MatchStatusBanner } from './MatchStatusBanner';
import { MatchScoreDisplay } from './MatchScoreDisplay';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface MatchBoxScoreSectionProps {
  match: SupabaseMatchData;
}

export const MatchBoxScoreSection: React.FC<MatchBoxScoreSectionProps> = ({ match }) => {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [playerFilter, setPlayerFilter] = useState<'all' | 'starters' | 'subs'>('all');
  
  // Fetch real box score data
  const { data: boxScoreData, isLoading, error } = useMatchBoxScore(match.azuro_game_id);
  
  // Fetch match data for states (description/report)
  const { data: matchData } = useMatchData(match.id);
  const states = matchData?.states as { description?: string; report?: string } | undefined;

  const homeTeamData = boxScoreData?.homeTeam;
  const awayTeamData = boxScoreData?.awayTeam;
  
  const currentTeamData = activeTeam === 'home' ? homeTeamData : awayTeamData;
  
  const filteredPlayers = useMemo(() => {
    if (!currentTeamData?.players) return [];
    
    return currentTeamData.players
      .filter(player => {
        if (playerFilter === 'starters') return !player.isSubstitute;
        if (playerFilter === 'subs') return player.isSubstitute;
        return true;
      })
      .sort((a, b) => parseFloat(b.matchRating || '0') - parseFloat(a.matchRating || '0'));
  }, [currentTeamData?.players, playerFilter]);

  const starters = currentTeamData?.players?.filter(p => !p.isSubstitute) || [];
  const subs = currentTeamData?.players?.filter(p => p.isSubstitute) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || (!homeTeamData && !awayTeamData)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Box score not available</p>
        {error && <p className="text-xs mt-1 text-destructive">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {/* Score Display */}
      <MatchScoreDisplay match={match} states={matchData?.states} />
      
      {/* Match Status */}
      <MatchStatusBanner description={states?.description} report={states?.report} />

      {/* Team Toggle - Native segmented control style */}
      <div className="flex bg-muted/50 p-1">
        <button
          onClick={() => setActiveTeam('home')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
            activeTeam === 'home'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          {(homeTeamData?.team?.logo || match.home_team?.logo) && (
            <img 
              src={homeTeamData?.team?.logo || match.home_team?.logo} 
              alt="" 
              className="w-5 h-5 object-contain" 
            />
          )}
          <span className="truncate">{homeTeamData?.team?.name || match.home_team?.name || 'Home'}</span>
        </button>
        <button
          onClick={() => setActiveTeam('away')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
            activeTeam === 'away'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          {(awayTeamData?.team?.logo || match.away_team?.logo) && (
            <img 
              src={awayTeamData?.team?.logo || match.away_team?.logo} 
              alt="" 
              className="w-5 h-5 object-contain" 
            />
          )}
          <span className="truncate">{awayTeamData?.team?.name || match.away_team?.name || 'Away'}</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 px-3 py-3">
        {[
          { key: 'all', label: `All (${currentTeamData?.players?.length || 0})` },
          { key: 'starters', label: `Starters (${starters.length})` },
          { key: 'subs', label: `Substitutes (${subs.length})` }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPlayerFilter(key as typeof playerFilter)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              playerFilter === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>Player</span>
        <span>Rating</span>
      </div>
      
      {/* Players List */}
      {filteredPlayers.length > 0 ? (
        <div className="divide-y divide-border">
          {filteredPlayers.map((player) => (
            <BoxScorePlayerCard 
              key={player.id} 
              player={player as any}
              isLast={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No players</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground px-3 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-yellow-600 bg-yellow-500/20 px-1 rounded">C</span>
          <span>Captain</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-3.5 bg-yellow-500 rounded-[2px]" />
          <span>Yellow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px]" />
          <span>Red</span>
        </div>
      </div>
    </div>
  );
};
