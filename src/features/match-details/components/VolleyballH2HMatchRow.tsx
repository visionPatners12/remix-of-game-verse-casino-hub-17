import React, { memo } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { H2HMatch } from '../types/h2h';

interface VolleyballH2HMatchRowProps {
  match: H2HMatch;
  currentHomeTeamId?: string;
}

export const VolleyballH2HMatchRow = memo(function VolleyballH2HMatchRow({ 
  match, 
  currentHomeTeamId 
}: VolleyballH2HMatchRowProps) {
  const { homeTeam, awayTeam, homeScore, awayScore, date, competition, volleyballData } = match;
  
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;
  const isCurrentHomeWinner = (homeTeam.id === currentHomeTeamId && homeWon) || 
                               (awayTeam.id === currentHomeTeamId && awayWon);
  
  // Format set scores for display
  const setScores = volleyballData ? [
    volleyballData.set1,
    volleyballData.set2,
    volleyballData.set3,
    volleyballData.set4,
    volleyballData.set5,
  ].filter(Boolean) : [];

  return (
    <div className="px-3 py-2.5 hover:bg-muted/20 transition-colors">
      {/* Date and Competition */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(date), 'MMM d, yyyy', { locale: enUS })}
        </span>
        {competition && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
            {competition.name}
          </span>
        )}
      </div>
      
      {/* Teams and Score */}
      <div className="flex items-center gap-2">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {homeTeam.logo && (
            <img src={homeTeam.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
          )}
          <span className={`text-xs truncate ${homeWon ? 'font-semibold' : 'text-muted-foreground'}`}>
            {homeTeam.name}
          </span>
        </div>
        
        {/* Score (sets won) */}
        <div className="flex items-center gap-1.5 px-2">
          <span className={`text-sm font-bold ${homeWon ? 'text-primary' : 'text-muted-foreground'}`}>
            {homeScore}
          </span>
          <span className="text-muted-foreground text-xs">-</span>
          <span className={`text-sm font-bold ${awayWon ? 'text-primary' : 'text-muted-foreground'}`}>
            {awayScore}
          </span>
        </div>
        
        {/* Away Team */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className={`text-xs truncate text-right ${awayWon ? 'font-semibold' : 'text-muted-foreground'}`}>
            {awayTeam.name}
          </span>
          {awayTeam.logo && (
            <img src={awayTeam.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
          )}
        </div>
      </div>
      
      {/* Set Scores */}
      {setScores.length > 0 && (
        <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-muted-foreground flex-wrap">
          {setScores.map((s, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-muted/30 rounded">
              S{idx + 1}: {s?.home}-{s?.away}
            </span>
          ))}
        </div>
      )}
      
      {/* Result indicator */}
      <div className="flex justify-center mt-1.5">
        <span className={`text-[10px] px-2 py-0.5 rounded ${
          isCurrentHomeWinner 
            ? 'bg-emerald-500/20 text-emerald-500' 
            : 'bg-destructive/20 text-destructive'
        }`}>
          {isCurrentHomeWinner ? 'W' : 'L'}
        </span>
      </div>
    </div>
  );
});
