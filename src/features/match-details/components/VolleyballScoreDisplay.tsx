import React from 'react';
import { LoadingSpinner } from '@/ui';
import { MatchStatusBanner } from './MatchStatusBanner';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import { parseStatesScore } from '@/features/sports/utils/payloadParser';

interface VolleyballScoreDisplayProps {
  match: SupabaseMatchData;
  matchData?: any;
  isLoading?: boolean;
}

export function VolleyballScoreDisplay({ match, matchData, isLoading }: VolleyballScoreDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Try to get states from matchData (Highlightly) or matchStates (Azuro stg_azuro_games)
  const states = matchData?.states || match.matchStates;
  const description = states?.description;
  const report = states?.report;
  
  // Use unified parser from payloadParser.ts
  const parsedScore = parseStatesScore(states, 'volleyball');
  
  if (!parsedScore) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Score unavailable</p>
      </div>
    );
  }
  
  const { home, away, breakdown } = parsedScore;
  
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
          <span className="text-5xl font-bold tabular-nums">{home}</span>
          <span className="text-2xl text-muted-foreground">-</span>
          <span className="text-5xl font-bold tabular-nums">{away}</span>
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
      
      {/* Set Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Sets
          </h3>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            {breakdown.map((set, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded">
                <span className="text-sm font-medium text-muted-foreground">{set.label}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {set.home} - {set.away}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
