import { VolleyballStanding } from '@/types/standings/volleyball';
import { getGoalDifferenceColor } from '@/utils/standingsUtils';

interface VolleyballStandingsRowProps {
  standing: VolleyballStanding;
}

export function VolleyballStandingsRow({ standing }: VolleyballStandingsRowProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-2 px-0.5 text-[10px] sm:text-sm font-medium w-8 sm:w-12">
        {standing.position}
      </td>
      <td className="py-2 px-0.5 min-w-[120px] sm:min-w-[180px]">
        <div className="flex items-center gap-1 sm:gap-2">
          <img 
            src={standing.team.logo} 
            alt={standing.team.name}
            className="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0"
          />
          <span className="text-[10px] sm:text-sm font-medium truncate">
            {standing.team.name}
          </span>
        </div>
      </td>
      <td className="text-center py-2 px-0.5 text-[10px] sm:text-sm w-8 sm:w-12">
        {standing.gamesPlayed}
      </td>
      <td className="text-center py-2 px-0.5 text-[10px] sm:text-sm w-8 sm:w-12">
        {standing.wins}
      </td>
      <td className="text-center py-2 px-0.5 text-[10px] sm:text-sm w-8 sm:w-12">
        {standing.losses}
      </td>
      <td className="text-center py-2 px-0.5 text-[10px] sm:text-sm w-8 sm:w-12">
        {standing.setsWon}
      </td>
      <td className="text-center py-2 px-0.5 text-[10px] sm:text-sm w-8 sm:w-12">
        {standing.setsLost}
      </td>
      <td className={`text-center py-2 px-0.5 text-[10px] sm:text-sm font-medium w-10 sm:w-14 ${getGoalDifferenceColor(standing.setsDifference)}`}>
        {standing.setsDifference > 0 ? '+' : ''}{standing.setsDifference}
      </td>
      <td className="text-center py-2 px-0.5 text-[10px] sm:text-sm font-bold w-8 sm:w-12">
        {standing.points}
      </td>
    </tr>
  );
}
