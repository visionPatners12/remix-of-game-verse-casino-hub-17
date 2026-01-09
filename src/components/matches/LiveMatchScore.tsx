import React, { memo } from 'react';
import { useLiveStats, type LiveStatsData } from '@/features/sports/hooks/useLiveStats';
import { cn } from '@/lib/utils';

interface LiveMatchScoreProps {
  /** Match object with gameId, sport, and state */
  match: {
    gameId?: string;
    azuro_game_id?: string;
    sport?: { sportId?: string; slug?: string };
    state?: string;
  };
  /** Display variant */
  variant?: 'compact' | 'full';
  /** Show game time */
  showTime?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Displays live match scores with real-time updates based on sport type
 * Uses useLiveStats hook for Azuro SDK integration
 */
export const LiveMatchScore = memo(function LiveMatchScore({
  match,
  variant = 'compact',
  showTime = true,
  className
}: LiveMatchScoreProps) {
  const sportSlug = match.sport?.slug;
  
  // Prepare game object for useLiveStats
  const gameData = {
    gameId: match.gameId || match.azuro_game_id,
    sport: match.sport,
    state: match.state
  };
  
  const liveData = useLiveStats(gameData, sportSlug);

  if (!liveData.isAvailable || liveData.isLoading) {
    return null;
  }

  // Football / Soccer
  if (sportSlug === 'soccer' || sportSlug === 'football') {
    return (
      <FootballScore 
        liveData={liveData} 
        variant={variant} 
        showTime={showTime}
        className={className}
      />
    );
  }

  // Basketball
  if (sportSlug === 'basketball') {
    return (
      <BasketballScore 
        liveData={liveData} 
        variant={variant} 
        showTime={showTime}
        className={className}
      />
    );
  }

  // Tennis
  if (sportSlug === 'tennis') {
    return (
      <TennisScore 
        liveData={liveData} 
        variant={variant}
        className={className}
      />
    );
  }

  // Volleyball
  if (sportSlug === 'volleyball') {
    return (
      <VolleyballScore 
        liveData={liveData} 
        variant={variant}
        className={className}
      />
    );
  }

  return null;
});

// Football Score Component
const FootballScore = memo(function FootballScore({
  liveData,
  variant,
  showTime,
  className
}: {
  liveData: LiveStatsData;
  variant: 'compact' | 'full';
  showTime: boolean;
  className?: string;
}) {
  const homeScore = liveData.soccerGoals?.home ?? 0;
  const awayScore = liveData.soccerGoals?.away ?? 0;
  const gameTime = liveData.gameTime;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className="font-bold text-sm">{homeScore}</span>
        <span className="text-muted-foreground text-xs">-</span>
        <span className="font-bold text-sm">{awayScore}</span>
        {showTime && gameTime && (
          <span className="text-xs text-emerald-500 font-medium ml-1">
            {gameTime.match(/^\d+$/) ? `${gameTime}'` : gameTime}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2 text-lg font-bold">
        <span className="min-w-[2ch] text-center">{homeScore}</span>
        <span className="text-muted-foreground text-sm">-</span>
        <span className="min-w-[2ch] text-center">{awayScore}</span>
      </div>
      {showTime && gameTime && (
        <span className="text-xs text-emerald-500 font-medium">
          {gameTime.match(/^\d+$/) ? `${gameTime}'` : gameTime}
        </span>
      )}
    </div>
  );
});

// Basketball Score Component
const BasketballScore = memo(function BasketballScore({
  liveData,
  variant,
  showTime,
  className
}: {
  liveData: LiveStatsData;
  variant: 'compact' | 'full';
  showTime: boolean;
  className?: string;
}) {
  const homeScore = liveData.basketballTotal?.home ?? 0;
  const awayScore = liveData.basketballTotal?.away ?? 0;
  const gameState = liveData.gameState;
  const gameTime = liveData.gameTime;

  // Format quarter display
  const formatQuarter = (state?: string): string => {
    if (!state) return '';
    const stateMap: Record<string, string> = {
      'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4',
      'H1': '1H', 'H2': '2H', 'HT': 'HT', 'OT': 'OT',
      'FT': 'FT', 'F': 'Final', 'IS': 'Break'
    };
    return stateMap[state] || state;
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className="font-bold text-sm">{homeScore}</span>
        <span className="text-muted-foreground text-xs">-</span>
        <span className="font-bold text-sm">{awayScore}</span>
        {showTime && (gameState || gameTime) && (
          <span className="text-xs text-emerald-500 font-medium ml-1">
            {formatQuarter(gameState)}
            {gameTime && ` ${gameTime}`}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2 text-lg font-bold">
        <span className="min-w-[2ch] text-center">{homeScore}</span>
        <span className="text-muted-foreground text-sm">-</span>
        <span className="min-w-[2ch] text-center">{awayScore}</span>
      </div>
      {showTime && (gameState || gameTime) && (
        <span className="text-xs text-emerald-500 font-medium">
          {formatQuarter(gameState)}
          {gameTime && ` • ${gameTime}`}
        </span>
      )}
    </div>
  );
});

// Tennis Score Component
const TennisScore = memo(function TennisScore({
  liveData,
  variant,
  className
}: {
  liveData: LiveStatsData;
  variant: 'compact' | 'full';
  className?: string;
}) {
  const homeSets = liveData.setsWon?.home ?? 0;
  const awaySets = liveData.setsWon?.away ?? 0;
  const homeGame = liveData.currentSetScore?.home ?? 0;
  const awayGame = liveData.currentSetScore?.away ?? 0;
  const homePoints = liveData.gamePoints?.home ?? 0;
  const awayPoints = liveData.gamePoints?.away ?? 0;

  // Convert tennis points to display format
  const formatPoints = (points: number): string => {
    const map: Record<number, string> = { 0: '0', 1: '15', 2: '30', 3: '40', 4: 'AD' };
    return map[points] ?? points.toString();
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className="font-bold text-sm">{homeSets}</span>
        <span className="text-muted-foreground text-xs">-</span>
        <span className="font-bold text-sm">{awaySets}</span>
        <span className="text-xs text-muted-foreground ml-1">
          ({homeGame}-{awayGame})
        </span>
        <span className="text-xs text-emerald-500 font-medium">
          {formatPoints(homePoints)}-{formatPoints(awayPoints)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2 text-lg font-bold">
        <span className="min-w-[2ch] text-center">{homeSets}</span>
        <span className="text-muted-foreground text-sm">-</span>
        <span className="min-w-[2ch] text-center">{awaySets}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Game: {homeGame}-{awayGame}</span>
        <span className="text-emerald-500">
          Points: {formatPoints(homePoints)}-{formatPoints(awayPoints)}
        </span>
      </div>
    </div>
  );
});

// Volleyball Score Component
const VolleyballScore = memo(function VolleyballScore({
  liveData,
  variant,
  className
}: {
  liveData: LiveStatsData;
  variant: 'compact' | 'full';
  className?: string;
}) {
  const homeSets = liveData.setsWon?.home ?? 0;
  const awaySets = liveData.setsWon?.away ?? 0;
  const homePoints = liveData.currentSetScore?.home ?? 0;
  const awayPoints = liveData.currentSetScore?.away ?? 0;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className="font-bold text-sm">{homeSets}</span>
        <span className="text-muted-foreground text-xs">-</span>
        <span className="font-bold text-sm">{awaySets}</span>
        <span className="text-xs text-emerald-500 font-medium ml-1">
          ({homePoints}-{awayPoints})
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2 text-lg font-bold">
        <span className="min-w-[2ch] text-center">{homeSets}</span>
        <span className="text-muted-foreground text-sm">-</span>
        <span className="min-w-[2ch] text-center">{awaySets}</span>
      </div>
      <span className="text-xs text-emerald-500 font-medium">
        Current set: {homePoints}-{awayPoints}
      </span>
    </div>
  );
});

export default LiveMatchScore;
