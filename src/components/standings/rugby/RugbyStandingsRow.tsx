import { RugbyStanding } from '@/types/standings/rugby';

interface RugbyStandingsRowProps {
  standing: RugbyStanding;
}

export function RugbyStandingsRow({ standing }: RugbyStandingsRowProps) {
  const getDiffColor = (diff: number): string => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      {standing.description && (
        <td className="absolute left-0 top-0 bottom-0 w-1">
          <div className="h-full w-full" style={{ backgroundColor: standing.description }} />
        </td>
      )}
      
      <td className="px-1 md:px-2 py-2 md:py-3">
        <span className="text-[10px] md:text-xs font-semibold">{standing.position}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3">
        <div className="flex items-center gap-1 md:gap-2">
          <img 
            src={standing.team.logo} 
            alt={standing.team.name}
            className="w-5 h-5 md:w-8 md:h-8 object-contain"
          />
          <span className="text-[11px] md:text-sm font-medium truncate">{standing.team.name}</span>
        </div>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm">{standing.gamesPlayed}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm">{standing.wins}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm">{standing.draws}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm">{standing.loses}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm">{standing.scoredPoints}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm">{standing.receivedPoints}</span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className={`text-[11px] md:text-sm font-medium ${getDiffColor(standing.pointsDifference)}`}>
          {standing.pointsDifference > 0 ? '+' : ''}{standing.pointsDifference}
        </span>
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[11px] md:text-sm font-bold">{standing.points}</span>
      </td>
    </tr>
  );
}
