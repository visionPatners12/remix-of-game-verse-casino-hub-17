import React from "react";
import { cn } from "@/lib/utils";
import type { ParsedScore } from "@/features/sports/utils/payloadParser";

interface ScoreDisplayProps {
  score: ParsedScore;
  teamAName: string;
  teamBName: string;
  isFinished?: boolean;
  viewMode?: 'grid' | 'list' | 'horizontal';
}

export function ScoreDisplay({ 
  score, 
  teamAName, 
  teamBName, 
  isFinished = false,
  viewMode = 'grid' 
}: ScoreDisplayProps) {
  const isCompact = viewMode === 'grid';

  // Determine winner for highlighting
  const homeWinner = isFinished && score.home > score.away;
  const awayWinner = isFinished && score.away > score.home;

  return (
    <div className="space-y-2">
      {/* Main Score */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={cn(
            "text-sm truncate",
            homeWinner && "font-bold text-primary"
          )}>
            {teamAName}
          </div>
        </div>
        <div className={cn(
          "text-2xl font-bold min-w-[2rem] text-center",
          homeWinner && "text-primary"
        )}>
          {score.home}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={cn(
            "text-sm truncate",
            awayWinner && "font-bold text-primary"
          )}>
            {teamBName}
          </div>
        </div>
        <div className={cn(
          "text-2xl font-bold min-w-[2rem] text-center",
          awayWinner && "text-primary"
        )}>
          {score.away}
        </div>
      </div>

      {/* Breakdown (quarters, sets, etc.) */}
      {score.breakdown && score.breakdown.length > 0 && !isCompact && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-8"></div>
              {score.breakdown.map((period) => (
                <div key={period.label} className="w-10 text-center font-semibold">
                  {period.label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-8 truncate" title={teamAName}>{teamAName.slice(0, 3)}</div>
              {score.breakdown.map((period, idx) => (
                <div key={`home-${idx}`} className="w-10 text-center font-medium">
                  {period.home}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-8 truncate" title={teamBName}>{teamBName.slice(0, 3)}</div>
              {score.breakdown.map((period, idx) => (
                <div key={`away-${idx}`} className="w-10 text-center font-medium">
                  {period.away}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
