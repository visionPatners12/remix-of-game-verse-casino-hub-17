import { NFLStanding } from '@/types/standings/nfl';
import { useNavigate } from 'react-router-dom';

interface NFLStandingsRowProps {
  standing: NFLStanding;
  showDivision?: boolean;
}

export function NFLStandingsRow({ standing, showDivision }: NFLStandingsRowProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (standing.team.slug) {
      navigate(`/team/${standing.team.slug}`);
    }
  };

  const formatPCT = (pct: number): string => {
    return pct.toFixed(3);
  };

  const getStreakColor = (streak: string): string => {
    if (streak.startsWith('W')) return 'text-green-600';
    if (streak.startsWith('L')) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getDiffColor = (diff: string): string => {
    if (diff.startsWith('+')) return 'text-green-600';
    if (diff.startsWith('-')) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr
      onClick={handleClick}
      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-xs font-semibold text-muted-foreground">
          {standing.position > 0 ? standing.position : ''}
        </span>
      </td>

      <td className="px-2 md:px-4 py-2 md:py-3 min-w-[90px] md:min-w-[180px]">
        <div className="flex items-center gap-1.5 md:gap-3">
          <img
            src={standing.team.logo}
            alt={standing.team.name}
            className="w-5 h-5 md:w-8 md:h-8 object-contain flex-shrink-0"
          />
          <span className="font-semibold text-[11px] md:text-sm truncate">{standing.team.name}</span>
        </div>
      </td>

      <td className="px-2 md:px-3 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm text-muted-foreground">
          {standing.overall_record || '-'}
        </span>
      </td>

      <td className="px-2 md:px-3 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm font-semibold">{formatPCT(standing.win_pct)}</span>
      </td>

      <td className="px-2 md:px-3 py-2 md:py-3 text-center">
        <span className={`text-[11px] md:text-sm font-semibold ${getDiffColor(standing.differential)}`}>
          {standing.differential}
        </span>
      </td>

      <td className="px-2 md:px-3 py-2 md:py-3 text-center">
        <span className={`text-[11px] md:text-sm font-semibold ${getStreakColor(standing.streak || '')}`}>
          {standing.streak || '-'}
        </span>
      </td>

      <td className="hidden md:table-cell px-2 md:px-3 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm text-muted-foreground">
          {standing.division_record || '-'}
        </span>
      </td>
    </tr>
  );
}
