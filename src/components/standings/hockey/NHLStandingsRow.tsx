import { HockeyStanding } from '@/types/standings/hockey';
import { useNavigate } from 'react-router-dom';

interface NHLStandingsRowProps {
  standing: HockeyStanding;
}

export function NHLStandingsRow({ standing }: NHLStandingsRowProps) {
  const navigate = useNavigate();

  const handleTeamClick = () => {
    if (standing.team.id) {
      navigate(`/team/${standing.team.id}`);
    }
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const formatDifference = (diff: number) => {
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  const getStreakColor = (streak: string) => {
    if (streak.startsWith('W')) return 'text-green-600';
    if (streak.startsWith('L')) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-xs font-semibold text-muted-foreground">
          {standing.position || '-'}
        </span>
      </td>
      <td className="px-1.5 md:px-4 py-2 md:py-3">
        <div 
          className="flex items-center gap-1.5 md:gap-3 cursor-pointer hover:opacity-80"
          onClick={handleTeamClick}
        >
          <img 
            src={standing.team.logo} 
            alt={standing.team.name}
            className="w-5 h-5 md:w-8 md:h-8 object-contain flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <span className="font-semibold text-[10px] md:text-sm text-foreground truncate max-w-[70px] md:max-w-none">
            {standing.team.name}
          </span>
        </div>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {standing.gamesPlayed || '-'}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {standing.wins || '-'}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {standing.losses || '-'}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {standing.overtimeLosses || '-'}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-bold text-foreground">
          {standing.points || '-'}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {standing.goalsFor || '-'}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {standing.goalsAgainst || '-'}
        </span>
      </td>
      <td className={`px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-sm font-semibold ${getDifferenceColor(standing.goalDifference)}`}>
        {standing.goalDifference !== 0 ? formatDifference(standing.goalDifference) : '-'}
      </td>
      <td className={`px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-sm font-semibold ${getStreakColor(standing.streak)}`}>
        {standing.streak || '-'}
      </td>
    </tr>
  );
}
