import { FootballStanding } from '@/types/standings/football';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FootballStandingsRowProps {
  standing: FootballStanding;
}

export function FootballStandingsRow({ standing }: FootballStandingsRowProps) {
  const navigate = useNavigate();

  const handleTeamClick = () => {
    navigate(`/team/${standing.team.id}`);
  };
  const getStatusIcon = (status?: string) => {
    if (status === 'up') return <ArrowUp className="w-3 h-3 text-success" />;
    if (status === 'down') return <ArrowDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const formatForm = (form?: string) => {
    if (!form) return null;
    
    return form.split('').map((result, index) => (
      <span
        key={index}
        className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded ${
          result === 'W' ? 'bg-success/20 text-success' :
          result === 'D' ? 'bg-warning/20 text-warning' :
          result === 'L' ? 'bg-destructive/20 text-destructive' :
          'bg-muted text-muted-foreground'
        }`}
      >
        {result}
      </span>
    ));
  };

  const getGoalDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-success';
    if (diff < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      {/* Position with zone color */}
      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="font-semibold text-sm">{standing.position}</span>
          {standing.status && getStatusIcon(standing.status)}
        </div>
      </td>

      {/* Team */}
      <td className="py-3 px-2 cursor-pointer hover:bg-muted/50 transition-colors w-20" onClick={handleTeamClick}>
        <div className="flex items-center gap-1">
          <img
            src={standing.team.logo}
            alt={standing.team.name}
            className="w-4 h-4 object-contain flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <span className="font-medium text-xs truncate min-w-0 hover:text-primary transition-colors">
            {standing.team.name}
          </span>
        </div>
      </td>

      {/* Matches Played */}
      <td className="py-3 px-2 text-center text-sm">
        {standing.played}
      </td>

      {/* Wins */}
      <td className="py-3 px-2 text-center text-sm font-medium">
        {standing.wins}
      </td>

      {/* Draws */}
      <td className="py-3 px-2 text-center text-sm font-medium">
        {standing.draws}
      </td>

      {/* Losses */}
      <td className="py-3 px-2 text-center text-sm font-medium">
        {standing.losses}
      </td>

      {/* Goals For */}
      <td className="py-3 px-2 text-center text-sm">
        {standing.goals_for}
      </td>

      {/* Goals Against */}
      <td className="py-3 px-2 text-center text-sm">
        {standing.goals_against}
      </td>

      {/* Goal Difference */}
      <td className="py-3 px-2 text-center text-sm font-semibold">
        <span className={getGoalDifferenceColor(standing.goal_difference)}>
          {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
        </span>
      </td>

      {/* Points */}
      <td className="py-3 px-2 text-center text-sm font-bold text-primary">
        {standing.points}
      </td>

      {/* Form */}
      <td className="py-3 px-2">
        <div className="flex gap-1 justify-center">
          {formatForm(standing.form)}
        </div>
      </td>
    </tr>
  );
}