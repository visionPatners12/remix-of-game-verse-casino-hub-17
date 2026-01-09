import React from 'react';
import { LoadingSpinner } from '@/ui';
import { MatchStatusBanner } from './MatchStatusBanner';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface HockeyScoreDisplayProps {
  match: SupabaseMatchData;
  matchData?: any;
  isLoading?: boolean;
}

interface PeriodScores {
  firstPeriod?: { home: number; away: number };
  secondPeriod?: { home: number; away: number };
  thirdPeriod?: { home: number; away: number };
  overtimePeriod?: { home: number; away: number };
}

// Parse hockey scores from states (sports_data.match.states)
const parseHockeyScores = (states: any): { total: { home: number; away: number }; periods: PeriodScores } | null => {
  if (!states) return null;
  
  try {
    let totalHome = 0;
    let totalAway = 0;
    
    // Parse total score from states.score (format: "0 - 1")
    if (typeof states.score === 'string') {
      const parts = states.score.split('-').map((s: string) => parseInt(s.trim(), 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        totalHome = parts[0];
        totalAway = parts[1];
      }
    }
    
    // Extract period scores from scoreDetails
    const periods: PeriodScores = {};
    const details = states.scoreDetails;
    
    if (details) {
      if (typeof details.firstPeriod === 'string') {
        const p = details.firstPeriod.split('-').map((s: string) => parseInt(s.trim(), 10));
        if (p.length === 2) periods.firstPeriod = { home: p[0] || 0, away: p[1] || 0 };
      }
      if (typeof details.secondPeriod === 'string') {
        const p = details.secondPeriod.split('-').map((s: string) => parseInt(s.trim(), 10));
        if (p.length === 2) periods.secondPeriod = { home: p[0] || 0, away: p[1] || 0 };
      }
      if (typeof details.thirdPeriod === 'string') {
        const p = details.thirdPeriod.split('-').map((s: string) => parseInt(s.trim(), 10));
        if (p.length === 2) periods.thirdPeriod = { home: p[0] || 0, away: p[1] || 0 };
      }
      if (typeof details.overtimePeriod === 'string') {
        const p = details.overtimePeriod.split('-').map((s: string) => parseInt(s.trim(), 10));
        if (p.length === 2) periods.overtimePeriod = { home: p[0] || 0, away: p[1] || 0 };
      }
    }
    
    return {
      total: { home: totalHome, away: totalAway },
      periods
    };
  } catch {
    return null;
  }
};

export function HockeyScoreDisplay({ match, matchData, isLoading }: HockeyScoreDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Use states from matchData (sports_data.match.states)
  const scores = parseHockeyScores(matchData?.states);
  const description = matchData?.states?.description;
  const report = matchData?.states?.report;
  
  if (!scores) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Score unavailable</p>
      </div>
    );
  }
  
  const { total, periods } = scores;
  const hasPeriodScores = Object.keys(periods).length > 0;
  
  return (
    <div className="space-y-6">
      {/* Match Status */}
      <MatchStatusBanner description={description} report={report} />
      
      {/* Final Score */}
      <div className="flex items-center justify-center gap-8 py-8">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2">
          {match.home_team?.logo && (
            <img 
              src={match.home_team.logo} 
              alt={match.home_team.name || match.home} 
              className="w-16 h-16 object-contain"
            />
          )}
          <span className="text-sm font-medium text-center line-clamp-2 max-w-[100px]">
            {match.home_team?.name || match.home}
          </span>
        </div>
        
        {/* Score */}
        <div className="flex items-center gap-4">
          <span className="text-5xl font-bold tabular-nums">{total.home}</span>
          <span className="text-2xl text-muted-foreground">-</span>
          <span className="text-5xl font-bold tabular-nums">{total.away}</span>
        </div>
        
        {/* Away Team */}
        <div className="flex flex-col items-center gap-2">
          {match.away_team?.logo && (
            <img 
              src={match.away_team.logo} 
              alt={match.away_team.name || match.away} 
              className="w-16 h-16 object-contain"
            />
          )}
          <span className="text-sm font-medium text-center line-clamp-2 max-w-[100px]">
            {match.away_team?.name || match.away}
          </span>
        </div>
      </div>
      
      {/* Period Breakdown */}
      {hasPeriodScores && (
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Period Scores
          </h3>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            {periods.firstPeriod && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded">
                <span className="text-sm font-medium text-muted-foreground">P1</span>
                <span className="text-sm font-semibold tabular-nums">
                  {periods.firstPeriod.home} - {periods.firstPeriod.away}
                </span>
              </div>
            )}
            {periods.secondPeriod && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded">
                <span className="text-sm font-medium text-muted-foreground">P2</span>
                <span className="text-sm font-semibold tabular-nums">
                  {periods.secondPeriod.home} - {periods.secondPeriod.away}
                </span>
              </div>
            )}
            {periods.thirdPeriod && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded">
                <span className="text-sm font-medium text-muted-foreground">P3</span>
                <span className="text-sm font-semibold tabular-nums">
                  {periods.thirdPeriod.home} - {periods.thirdPeriod.away}
                </span>
              </div>
            )}
            {periods.overtimePeriod && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded">
                <span className="text-sm font-medium text-muted-foreground">OT</span>
                <span className="text-sm font-semibold tabular-nums">
                  {periods.overtimePeriod.home} - {periods.overtimePeriod.away}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
