import { BasketballStanding } from '@/types/standings/basketball';
import { useNavigate } from 'react-router-dom';

interface BasketballStandingsRowProps {
  standing: BasketballStanding;
  descriptionColor?: string;
}

export function BasketballStandingsRow({ standing, descriptionColor }: BasketballStandingsRowProps) {
  const navigate = useNavigate();

  const handleTeamClick = () => {
    if (standing.team.slug) {
      navigate(`/team/${standing.team.id}`);
    }
  };

  const pointsDiff = standing.scoredPoints - standing.receivedPoints;
  const getDiffColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <div className="flex items-center gap-1.5 md:gap-2">
          {descriptionColor && (
            <div
              className="w-1 h-6 md:h-8"
              style={{ backgroundColor: descriptionColor }}
            />
          )}
          <span className="text-[10px] md:text-xs font-semibold">{standing.position}</span>
        </div>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3">
        <div
          className="flex items-center gap-1.5 md:gap-3 cursor-pointer hover:text-primary transition-colors"
          onClick={handleTeamClick}
        >
          <img
            src={standing.team.logo}
            alt={standing.team.name}
            className="w-5 h-5 md:w-8 md:h-8 object-contain"
          />
          <span className="text-[11px] md:text-sm font-semibold">{standing.team.name}</span>
        </div>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold">{standing.gamesPlayed}</td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold text-green-600">{standing.wins}</td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold text-red-600">{standing.losses}</td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold">{standing.scoredPoints}</td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold">{standing.receivedPoints}</td>
      <td className={`px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold ${getDiffColor(pointsDiff)}`}>
        {pointsDiff > 0 ? '+' : ''}{pointsDiff}
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center text-[11px] md:text-sm font-semibold">
        {standing.win_pct ? (typeof standing.win_pct === 'number' ? (standing.win_pct * 100).toFixed(1) : standing.win_pct) : '0.0'}%
      </td>
    </tr>
  );
}
