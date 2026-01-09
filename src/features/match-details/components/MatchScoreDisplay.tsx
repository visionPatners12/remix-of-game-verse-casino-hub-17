import React, { memo } from 'react';
import { parseStatesScore } from '@/features/sports/utils/payloadParser';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface MatchScoreDisplayProps {
  match: SupabaseMatchData;
  states?: any;
}

export const MatchScoreDisplay = memo(function MatchScoreDisplay({ 
  match, 
  states 
}: MatchScoreDisplayProps) {
  const sportSlug = match.sport?.slug || '';
  const parsedScore = parseStatesScore(states, sportSlug);
  
  if (!parsedScore) return null;
  
  return (
    <div className="py-4">
      {/* Main Score */}
      <div className="flex items-center justify-center gap-4">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.home_team?.logo && (
            <img 
              src={match.home_team.logo} 
              alt="" 
              className="w-12 h-12 object-contain"
            />
          )}
          <span className="text-sm font-medium text-center truncate max-w-[100px]">
            {match.home_team?.name || match.home || 'Home'}
          </span>
        </div>
        
        {/* Score */}
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold tabular-nums">{parsedScore.home}</span>
          <span className="text-xl text-muted-foreground">-</span>
          <span className="text-4xl font-bold tabular-nums">{parsedScore.away}</span>
        </div>
        
        {/* Away Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.away_team?.logo && (
            <img 
              src={match.away_team.logo} 
              alt="" 
              className="w-12 h-12 object-contain"
            />
          )}
          <span className="text-sm font-medium text-center truncate max-w-[100px]">
            {match.away_team?.name || match.away || 'Away'}
          </span>
        </div>
      </div>
      
      {/* Score Breakdown */}
      {parsedScore.breakdown && parsedScore.breakdown.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {parsedScore.breakdown.map((period, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center bg-muted/50 rounded px-3 py-1.5 min-w-[48px]"
            >
              <span className="text-[10px] text-muted-foreground uppercase font-medium">
                {period.label}
              </span>
              <span className="text-xs font-semibold tabular-nums">
                {period.home}-{period.away}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
