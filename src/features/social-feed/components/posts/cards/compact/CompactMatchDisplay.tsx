import React, { memo, useMemo } from 'react';
import { OptimizedTeamLogo } from '@/components/ui/optimized-team-logo';
import { useLiveStats } from '@/features/sports/hooks/useLiveStats';
import { cn } from '@/lib/utils';

interface CompactMatchDisplayProps {
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  isLost?: boolean;
  isWon?: boolean;
  isLive?: boolean;
  gameId?: string;
  sportId?: string;
  sportSlug?: string;
  className?: string;
}

/**
 * Premium face-off display with team logos and VS icon
 * Compact single-line layout: [Logo Team] ⚔️ [Team Logo]
 * Shows live scores when available
 */
export const CompactMatchDisplay = memo(function CompactMatchDisplay({
  homeTeam,
  awayTeam,
  homeTeamLogo,
  awayTeamLogo,
  isLost,
  isWon,
  isLive,
  gameId,
  sportId,
  sportSlug,
  className
}: CompactMatchDisplayProps) {
  if (!homeTeam && !awayTeam) return null;

  // Only fetch live data if all required params are present
  const shouldFetchLive = Boolean(isLive && gameId && sportId);
  
  // Get live data if match is live and has required data
  const gameData = useMemo(() => ({
    gameId: gameId || '',
    sport: { sportId: sportId || '', slug: sportSlug },
    state: shouldFetchLive ? 'Live' : undefined
  }), [gameId, sportId, sportSlug, shouldFetchLive]);

  const liveData = useLiveStats(gameData, sportSlug);
  const hasLiveData = shouldFetchLive && liveData.isAvailable;

  // Compute live score based on sport
  const liveScore = useMemo(() => {
    if (!hasLiveData) return null;
    
    if (sportSlug === 'soccer' || sportSlug === 'football') {
      return {
        home: liveData.soccerGoals?.home ?? 0,
        away: liveData.soccerGoals?.away ?? 0,
        time: liveData.gameTime ? (liveData.gameTime.match(/^\d+$/) ? `${liveData.gameTime}'` : liveData.gameTime) : null
      };
    }
    if (sportSlug === 'basketball') {
      const stateMap: Record<string, string> = {
        'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4',
        'H1': '1H', 'H2': '2H', 'HT': 'HT', 'OT': 'OT'
      };
      return {
        home: liveData.basketballTotal?.home ?? 0,
        away: liveData.basketballTotal?.away ?? 0,
        time: stateMap[liveData.gameState || ''] || liveData.gameState || null
      };
    }
    if (sportSlug === 'tennis') {
      return {
        home: liveData.setsWon?.home ?? 0,
        away: liveData.setsWon?.away ?? 0,
        time: `Set ${liveData.currentSet || 1}`
      };
    }
    if (sportSlug === 'volleyball') {
      return {
        home: liveData.setsWon?.home ?? 0,
        away: liveData.setsWon?.away ?? 0,
        time: `Set ${liveData.currentSet || 1}`
      };
    }
    return null;
  }, [hasLiveData, liveData, sportSlug]);

  return (
    <div className={cn(
      "flex items-center justify-between gap-2 px-3 py-2",
      "bg-muted/30",
      className
    )}>
      {/* Home Team */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {homeTeamLogo && (
          <OptimizedTeamLogo 
            src={homeTeamLogo}
            alt={`${homeTeam} logo`}
            teamName={homeTeam || 'Home'} 
            size="sm"
            className={cn(
              "shrink-0 transition-all duration-200",
              isLost && "grayscale opacity-50"
            )}
          />
        )}
        <span className={cn(
          "font-medium text-xs truncate transition-all duration-200",
          isLost && "line-through opacity-50",
          isWon && "text-emerald-600 dark:text-emerald-400"
        )}>
          {homeTeam}
        </span>
        {/* Live score for home team */}
        {liveScore && (
          <span className="font-bold text-sm text-foreground ml-auto">
            {liveScore.home}
          </span>
        )}
      </div>
      
      {/* VS or Score with Time */}
      <div className="shrink-0 flex flex-col items-center">
        {liveScore ? (
          <>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-red-500 animate-pulse">LIVE</span>
            </div>
            {liveScore.time && (
              <span className="text-[9px] text-emerald-500 font-medium">
                {liveScore.time}
              </span>
            )}
          </>
        ) : (
          <div className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground bg-muted/50">
            vs
          </div>
        )}
      </div>
      
      {/* Away Team */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        {/* Live score for away team */}
        {liveScore && (
          <span className="font-bold text-sm text-foreground mr-auto">
            {liveScore.away}
          </span>
        )}
        <span className={cn(
          "font-medium text-xs truncate text-right transition-all duration-200",
          isLost && "line-through opacity-50",
          isWon && "text-emerald-600 dark:text-emerald-400"
        )}>
          {awayTeam}
        </span>
        {awayTeamLogo && (
          <OptimizedTeamLogo 
            src={awayTeamLogo}
            alt={`${awayTeam} logo`}
            teamName={awayTeam || 'Away'} 
            size="sm"
            className={cn(
              "shrink-0 transition-all duration-200",
              isLost && "grayscale opacity-50"
            )}
          />
        )}
      </div>
    </div>
  );
});
