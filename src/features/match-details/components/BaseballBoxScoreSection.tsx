import React from 'react';
import { Loader2 } from 'lucide-react';
import type { MatchDataResponse } from '../hooks/useMatchData';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import { MatchStatusBanner } from './MatchStatusBanner';

interface BaseballStates {
  score: string;
  report: string;
  description: string;
  scoreDetails: {
    home: {
      hits: number;
      errors: number;
      innings: number[];
    };
    away: {
      hits: number;
      errors: number;
      innings: number[];
    };
  };
}

interface BaseballBoxScoreSectionProps {
  match: SupabaseMatchData;
  matchData: MatchDataResponse | null | undefined;
  isLoading: boolean;
}

export function BaseballBoxScoreSection({ match, matchData, isLoading }: BaseballBoxScoreSectionProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const states = matchData?.states as BaseballStates | undefined;
  
  if (!states?.scoreDetails) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No box score data available
      </div>
    );
  }

  const { scoreDetails, score, report, description } = states;
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  // Get max innings count (handle extra innings)
  const maxInnings = Math.max(
    scoreDetails.home?.innings?.length || 0,
    scoreDetails.away?.innings?.length || 0,
    9 // Minimum 9 innings display
  );

  // Calculate total runs
  const homeRuns = scoreDetails.home?.innings?.reduce((sum, r) => sum + (r || 0), 0) || 0;
  const awayRuns = scoreDetails.away?.innings?.reduce((sum, r) => sum + (r || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Match Status */}
      <MatchStatusBanner description={description} report={report} />

      {/* Final Score Header */}
      <div className="text-center py-4 border-b border-border">
        <p className="text-3xl font-bold">{score || `${homeRuns} - ${awayRuns}`}</p>
      </div>

      {/* Box Score Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground min-w-[100px]">Team</th>
              {Array.from({ length: maxInnings }).map((_, i) => (
                <th key={i} className="text-center py-3 px-1 font-medium text-muted-foreground w-8">
                  {i + 1}
                </th>
              ))}
              <th className="text-center py-3 px-2 font-bold bg-muted/30 w-10">R</th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground w-10">H</th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground w-10">E</th>
            </tr>
          </thead>
          <tbody>
            {/* Away Team Row */}
            <tr className="border-b border-border">
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {awayTeam?.logo && (
                    <img 
                      src={awayTeam.logo} 
                      alt={awayTeam.name || ''} 
                      className="h-5 w-5 object-contain"
                    />
                  )}
                  <span className="font-medium truncate">{(awayTeam as any)?.abbreviation || awayTeam?.name?.slice(0, 3).toUpperCase() || 'AWAY'}</span>
                </div>
              </td>
              {Array.from({ length: maxInnings }).map((_, i) => {
                const runs = scoreDetails.away?.innings?.[i];
                return (
                  <td key={i} className="text-center py-3 px-1 tabular-nums">
                    {runs !== undefined ? runs : '-'}
                  </td>
                );
              })}
              <td className="text-center py-3 px-2 font-bold bg-muted/30 tabular-nums">{awayRuns}</td>
              <td className="text-center py-3 px-2 tabular-nums">{scoreDetails.away?.hits || 0}</td>
              <td className="text-center py-3 px-2 tabular-nums">{scoreDetails.away?.errors || 0}</td>
            </tr>

            {/* Home Team Row */}
            <tr>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {homeTeam?.logo && (
                    <img 
                      src={homeTeam.logo} 
                      alt={homeTeam.name || ''} 
                      className="h-5 w-5 object-contain"
                    />
                  )}
                  <span className="font-medium truncate">{(homeTeam as any)?.abbreviation || homeTeam?.name?.slice(0, 3).toUpperCase() || 'HOME'}</span>
                </div>
              </td>
              {Array.from({ length: maxInnings }).map((_, i) => {
                const runs = scoreDetails.home?.innings?.[i];
                return (
                  <td key={i} className="text-center py-3 px-1 tabular-nums">
                    {runs !== undefined ? runs : '-'}
                  </td>
                );
              })}
              <td className="text-center py-3 px-2 font-bold bg-muted/30 tabular-nums">{homeRuns}</td>
              <td className="text-center py-3 px-2 tabular-nums">{scoreDetails.home?.hits || 0}</td>
              <td className="text-center py-3 px-2 tabular-nums">{scoreDetails.home?.errors || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-2">
        <span><strong>R</strong> = Runs</span>
        <span><strong>H</strong> = Hits</span>
        <span><strong>E</strong> = Errors</span>
      </div>
    </div>
  );
}
