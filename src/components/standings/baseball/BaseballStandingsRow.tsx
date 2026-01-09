import { BaseballStanding } from '@/types/standings/baseball';
import { useNavigate } from 'react-router-dom';

interface BaseballStandingsRowProps {
  standing: BaseballStanding;
}

export function BaseballStandingsRow({ standing }: BaseballStandingsRowProps) {
  const navigate = useNavigate();

  const handleRowClick = () => {
    if (standing.team.slug) {
      navigate(`/team/${standing.team.id}`);
    }
  };

  const getDiffColor = (diff: number): string => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr
      onClick={handleRowClick}
      className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
    >
      <td className="px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm font-semibold text-center text-muted-foreground">
        {standing.position}
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center gap-1 md:gap-2">
          <img src={standing.team.logo} alt={standing.team.name} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
          <span className="text-[11px] md:text-sm font-medium truncate">{standing.team.name}</span>
        </div>
      </td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center">{standing.wins}</td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center">{standing.losses}</td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center font-semibold">{standing.winPct.toFixed(3)}</td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center text-muted-foreground">{standing.gamesBehind}</td>
      <td className="hidden md:table-cell px-2 py-2 text-[11px] md:text-sm text-center text-muted-foreground">{standing.homeRecord}</td>
      <td className="hidden md:table-cell px-2 py-2 text-[11px] md:text-sm text-center text-muted-foreground">{standing.awayRecord}</td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center">{standing.runsScored}</td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center">{standing.runsAllowed}</td>
      <td className={`px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center font-semibold ${getDiffColor(standing.runDifferential)}`}>
        {standing.runDifferential > 0 ? '+' : ''}{standing.runDifferential}
      </td>
      <td className="px-2 md:px-3 py-2 md:py-3 text-[11px] md:text-sm text-center text-muted-foreground">{standing.streak}</td>
    </tr>
  );
}
