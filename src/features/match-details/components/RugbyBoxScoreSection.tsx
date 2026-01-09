import React from 'react';
import { LoadingSpinner } from '@/ui';
import { MatchStatusBanner } from './MatchStatusBanner';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface RugbyBoxScoreSectionProps {
  match: SupabaseMatchData;
  matchData?: any;
  isLoading?: boolean;
}

// Parse rugby scores from states (format: "33 - 20")
const parseRugbyScore = (states: any): { home: number; away: number } | null => {
  if (!states?.score || typeof states.score !== 'string') return null;
  
  const parts = states.score.split('-').map((s: string) => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { home: parts[0], away: parts[1] };
  }
  return null;
};

export function RugbyBoxScoreSection({ match, matchData, isLoading }: RugbyBoxScoreSectionProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  const score = parseRugbyScore(matchData?.states);
  const description = matchData?.states?.description;
  const report = matchData?.states?.report;
  
  if (!score) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Score unavailable</p>
      </div>
    );
  }
  
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
          <span className="text-5xl font-bold tabular-nums">{score.home}</span>
          <span className="text-2xl text-muted-foreground">-</span>
          <span className="text-5xl font-bold tabular-nums">{score.away}</span>
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
      
      {/* Full Time Badge */}
      <div className="flex justify-center">
        <span className="px-4 py-1.5 bg-muted/50 text-muted-foreground text-sm font-medium rounded-full">
          Full Time
        </span>
      </div>
    </div>
  );
}
