import React, { memo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { buildTeamUrl } from '@/utils/seoUrls';
import type { H2HMatch } from '../types/h2h';

interface H2HMatchRowProps {
  match: H2HMatch;
  currentHomeTeamId?: string;
}

export const H2HMatchRow = memo(function H2HMatchRow({ match, currentHomeTeamId }: H2HMatchRowProps) {
  const navigate = useNavigate();
  
  const formattedDate = format(new Date(match.date), 'dd MMM yyyy');
  
  // Determine if current home team won, lost, or drew
  const isCurrentHomeTeamHome = match.homeTeam.id === currentHomeTeamId;
  const currentTeamScore = isCurrentHomeTeamHome ? match.homeScore : match.awayScore;
  const opponentScore = isCurrentHomeTeamHome ? match.awayScore : match.homeScore;
  
  const result = currentTeamScore > opponentScore ? 'win' : currentTeamScore < opponentScore ? 'loss' : 'draw';
  
  const resultColors = {
    win: 'text-green-500',
    loss: 'text-red-500',
    draw: 'text-muted-foreground'
  };

  const handleTeamClick = (team: { id: string; name: string }) => {
    navigate(buildTeamUrl({ id: team.id, name: team.name }));
  };

  return (
    <div className="flex items-center gap-2 py-3 px-3 hover:bg-muted/30 transition-colors">
      {/* Date */}
      <span className="text-xs text-muted-foreground w-20 shrink-0">
        {formattedDate}
      </span>
      
      {/* Home Team */}
      <div 
        className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer hover:opacity-80"
        onClick={() => handleTeamClick({ id: match.homeTeam.id, name: match.homeTeam.name })}
      >
        {match.homeTeam.logo && (
          <img src={match.homeTeam.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
        )}
        <span className="text-sm truncate">{match.homeTeam.name}</span>
      </div>
      
      {/* Score */}
      <div className={`flex items-center gap-1 font-semibold text-sm shrink-0 ${resultColors[result]}`}>
        <span className={match.homeScore > match.awayScore ? 'text-foreground' : ''}>
          {match.homeScore}
        </span>
        <span className="text-muted-foreground">-</span>
        <span className={match.awayScore > match.homeScore ? 'text-foreground' : ''}>
          {match.awayScore}
        </span>
      </div>
      
      {/* Away Team */}
      <div 
        className="flex items-center gap-1.5 flex-1 min-w-0 justify-end cursor-pointer hover:opacity-80"
        onClick={() => handleTeamClick({ id: match.awayTeam.id, name: match.awayTeam.name })}
      >
        <span className="text-sm truncate text-right">{match.awayTeam.name}</span>
        {match.awayTeam.logo && (
          <img src={match.awayTeam.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
        )}
      </div>
      
      {/* Competition Badge */}
      {match.competition && (
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 hidden sm:block">
          {match.competition.name}
        </span>
      )}
    </div>
  );
});
