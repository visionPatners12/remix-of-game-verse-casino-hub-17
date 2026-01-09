import React, { memo, useMemo } from 'react';
import { Activity, Loader2, BarChart3 } from 'lucide-react';
import { useLiveStats } from '@/features/sports/hooks/useLiveStats';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import { GameState } from '@azuro-org/toolkit';

interface AzuroBasketballStatsSectionProps {
  match: SupabaseMatchData;
}

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}

const StatBar = memo(function StatBar({ label, homeValue, awayValue, isPercentage }: StatBarProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  const formatValue = (value: number) => {
    if (isPercentage) return `${value.toFixed(0)}%`;
    return value.toString();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{formatValue(homeValue)}</span>
        <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
        <span className="font-medium text-foreground">{formatValue(awayValue)}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
        <div 
          className="bg-primary transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-muted-foreground/40 transition-all duration-500"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
});

// Map state strings to GameState enum values
const stateMapping: Record<string, GameState> = {
  'prematch': GameState.Prematch,
  'live': GameState.Live,
};

export const AzuroBasketballStatsSection = memo(function AzuroBasketballStatsSection({ match }: AzuroBasketballStatsSectionProps) {
  // Prepare game object for useLiveStats
  const gameForLiveStats = useMemo(() => {
    const stateValue = match.state?.toLowerCase() || 'live';
    const mappedState = stateMapping[stateValue] || GameState.Live;
    
    return {
      gameId: match.azuro_game_id,
      sport: {
        sportId: (match as any).payload?.sport?.sportId || '6',
      },
      state: mappedState,
    };
  }, [match.azuro_game_id, match.state, (match as any).payload?.sport?.sportId]);

  const liveStats = useLiveStats(gameForLiveStats, 'basketball');

  const homeName = match.home_team?.name || match.home || 'Home';
  const awayName = match.away_team?.name || match.away || 'Away';
  const homeLogo = match.home_team?.logo;
  const awayLogo = match.away_team?.logo;

  if (liveStats.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm">Loading live statistics...</p>
      </div>
    );
  }

  if (!liveStats.isAvailable || !liveStats.basketballStats) {
    return (
      <div className="space-y-6 p-4">
        {/* Team headers */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            {homeLogo && (
              <img src={homeLogo} alt={homeName} className="w-8 h-8 object-contain" />
            )}
            <span className="font-semibold text-sm">{homeName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{awayName}</span>
            {awayLogo && (
              <img src={awayLogo} alt={awayName} className="w-8 h-8 object-contain" />
            )}
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Azuro Stats</h3>
          <p className="text-sm">Indisponible</p>
        </div>
      </div>
    );
  }

  const stats = liveStats.basketballStats;
  const bTotal = liveStats.basketballTotal;
  const bQuarters = liveStats.basketballQuarters;

  // Helper to check if stat is available (not null)
  const isAvailable = (stat: { home: number; away: number } | null | undefined): stat is { home: number; away: number } => {
    return stat !== null && stat !== undefined;
  };

  // Count available stats
  const availableStatsCount = Object.values(stats).filter(isAvailable).length;

  // Group stats by category and check availability
  const scoringStats = [
    { key: 'twoPointers', label: '2-Point Shots', stat: stats.twoPointers },
    { key: 'threePointers', label: '3-Point Shots', stat: stats.threePointers },
    { key: 'freeThrows', label: 'Free Throws', stat: stats.freeThrows },
    { key: 'freeThrowsScoredPerc', label: 'FT %', stat: stats.freeThrowsScoredPerc, isPercentage: true },
  ].filter(s => isAvailable(s.stat));

  const reboundStats = [
    { key: 'totalRebounds', label: 'Total Rebounds', stat: stats.totalRebounds },
    { key: 'offensiveRebounds', label: 'Offensive Rebounds', stat: stats.offensiveRebounds },
    { key: 'defensiveRebounds', label: 'Defensive Rebounds', stat: stats.defensiveRebounds },
  ].filter(s => isAvailable(s.stat));

  const playmakingStats = [
    { key: 'assists', label: 'Assists', stat: stats.assists },
    { key: 'steals', label: 'Steals', stat: stats.steals },
    { key: 'blocks', label: 'Blocks', stat: stats.blocks },
    { key: 'turnovers', label: 'Turnovers', stat: stats.turnovers },
  ].filter(s => isAvailable(s.stat));

  const otherStats = [
    { key: 'fouls', label: 'Fouls', stat: stats.fouls },
    { key: 'timeoutsTaken', label: 'Timeouts Taken', stat: stats.timeoutsTaken },
    { key: 'timeoutsRemaining', label: 'Timeouts Remaining', stat: stats.timeoutsRemaining },
    { key: 'jumpBalls', label: 'Jump Balls', stat: stats.jumpBalls },
    { key: 'playersDisqualified', label: 'Players Disqualified', stat: stats.playersDisqualified },
  ].filter(s => isAvailable(s.stat) && (s.key !== 'playersDisqualified' || (s.stat!.home > 0 || s.stat!.away > 0)));

  return (
    <div className="space-y-6 p-4">
      {/* Team headers with live indicator */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          {homeLogo && (
            <img src={homeLogo} alt={homeName} className="w-8 h-8 object-contain" />
          )}
          <span className="font-semibold text-sm">{homeName}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-medium text-destructive uppercase">Live</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{awayName}</span>
          {awayLogo && (
            <img src={awayLogo} alt={awayName} className="w-8 h-8 object-contain" />
          )}
        </div>
      </div>

      {/* Score & Quarter breakdown */}
      {bTotal && (
        <div className="border-b border-border pb-6">
          <div className="flex justify-center items-center gap-8 mb-4">
            <span className="text-4xl font-bold text-primary">{bTotal.home}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-4xl font-bold">{bTotal.away}</span>
          </div>
          {liveStats.gameState && (
            <p className="text-center text-sm text-muted-foreground mb-4">
              {liveStats.gameState} {liveStats.gameTime && `• ${liveStats.gameTime}`}
            </p>
          )}
          
          {/* Quarter scores */}
          {bQuarters && (
            <div className="flex justify-center gap-4 text-sm">
              {[
                { label: 'Q1', data: bQuarters.q1 },
                { label: 'Q2', data: bQuarters.q2 },
                { label: 'Q3', data: bQuarters.q3 },
                { label: 'Q4', data: bQuarters.q4 },
              ].filter(q => q.data.home > 0 || q.data.away > 0).map(q => (
                <div key={q.label} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{q.label}</div>
                  <div className="font-mono text-xs">{q.data.home} - {q.data.away}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Limited coverage message */}
      {availableStatsCount < 5 && availableStatsCount > 0 && (
        <p className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
          Coverage for this match is limited. Only available statistics are shown.
        </p>
      )}

      {/* No detailed stats available */}
      {availableStatsCount === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Detailed statistics not available for this match</p>
        </div>
      )}

      {/* Stats bars - organized by category */}
      {availableStatsCount > 0 && (
        <div className="space-y-6">
          {/* Scoring */}
          {scoringStats.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground text-center">Scoring</h4>
              {scoringStats.map(s => (
                <StatBar key={s.key} label={s.label} homeValue={s.stat!.home} awayValue={s.stat!.away} isPercentage={s.isPercentage} />
              ))}
            </div>
          )}

          {/* Rebounds */}
          {reboundStats.length > 0 && (
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground text-center">Rebounds</h4>
              {reboundStats.map(s => (
                <StatBar key={s.key} label={s.label} homeValue={s.stat!.home} awayValue={s.stat!.away} />
              ))}
            </div>
          )}

          {/* Playmaking */}
          {playmakingStats.length > 0 && (
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground text-center">Playmaking</h4>
              {playmakingStats.map(s => (
                <StatBar key={s.key} label={s.label} homeValue={s.stat!.home} awayValue={s.stat!.away} />
              ))}
            </div>
          )}

          {/* Other */}
          {otherStats.length > 0 && (
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground text-center">Other</h4>
              {otherStats.map(s => (
                <StatBar key={s.key} label={s.label} homeValue={s.stat!.home} awayValue={s.stat!.away} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
