import React, { memo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { H2HMatch } from '../types/h2h';

interface CricketH2HMatchRowProps {
  match: H2HMatch;
  currentHomeTeamId?: string;
}

const formatBadgeStyle: Record<string, string> = {
  'T20': 'bg-amber-500/20 text-amber-500',
  'ODI': 'bg-blue-500/20 text-blue-500',
  'Test': 'bg-purple-500/20 text-purple-500',
};

export const CricketH2HMatchRow = memo(function CricketH2HMatchRow({ 
  match, 
  currentHomeTeamId 
}: CricketH2HMatchRowProps) {
  const navigate = useNavigate();
  
  const formattedDate = format(new Date(match.date), 'dd MMM yyyy');
  const cricket = match.cricketData;
  
  // Determine if current home team won based on score comparison
  const isCurrentHomeTeamHome = match.homeTeam.id === currentHomeTeamId;
  const currentTeamScore = isCurrentHomeTeamHome ? match.homeScore : match.awayScore;
  const opponentScore = isCurrentHomeTeamHome ? match.awayScore : match.homeScore;
  
  const result = currentTeamScore > opponentScore ? 'win' : currentTeamScore < opponentScore ? 'loss' : 'draw';
  
  const resultColors = {
    win: 'border-l-green-500',
    loss: 'border-l-red-500',
    draw: 'border-l-muted-foreground'
  };

  const handleTeamClick = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/team/${teamId}`);
  };

  const formatStyle = cricket?.format 
    ? formatBadgeStyle[cricket.format] || 'bg-muted text-muted-foreground'
    : 'bg-muted text-muted-foreground';

  return (
    <div className={`flex flex-col gap-2 py-3 px-3 hover:bg-muted/30 transition-colors border-l-2 ${resultColors[result]}`}>
      {/* Top row: Format badge + Date */}
      <div className="flex items-center gap-2">
        {cricket?.format && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${formatStyle}`}>
            {cricket.format}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
        {match.competition && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-auto">
            {match.competition.name}
          </span>
        )}
      </div>
      
      {/* Teams and Scores */}
      <div className="flex items-center gap-3">
        {/* Home Team */}
        <div 
          className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer hover:opacity-80"
          onClick={(e) => handleTeamClick(match.homeTeam.id, e)}
        >
          {match.homeTeam.logo && (
            <img src={match.homeTeam.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
          )}
          <span className="text-sm truncate">{match.homeTeam.name}</span>
        </div>
        
        {/* Cricket Score (runs/wickets format) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center gap-2 font-mono text-sm font-semibold">
            <span className={match.homeScore > match.awayScore ? 'text-foreground' : 'text-muted-foreground'}>
              {cricket?.homeScoreStr || match.homeScore}
            </span>
            <span className="text-muted-foreground text-xs">vs</span>
            <span className={match.awayScore > match.homeScore ? 'text-foreground' : 'text-muted-foreground'}>
              {cricket?.awayScoreStr || match.awayScore}
            </span>
          </div>
          {cricket?.overs && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {cricket.overs.home && <span>{cricket.overs.home}</span>}
              {cricket.overs.away && <span>{cricket.overs.away}</span>}
            </div>
          )}
        </div>
        
        {/* Away Team */}
        <div 
          className="flex items-center gap-1.5 flex-1 min-w-0 justify-end cursor-pointer hover:opacity-80"
          onClick={(e) => handleTeamClick(match.awayTeam.id, e)}
        >
          <span className="text-sm truncate text-right">{match.awayTeam.name}</span>
          {match.awayTeam.logo && (
            <img src={match.awayTeam.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
          )}
        </div>
      </div>
      
      {/* Result Report */}
      {cricket?.report && (
        <p className="text-xs text-muted-foreground italic pl-1">
          {cricket.report}
        </p>
      )}
    </div>
  );
});
