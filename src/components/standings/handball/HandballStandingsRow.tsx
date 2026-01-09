import { HandballStanding } from '@/types/standings/handball';

interface HandballStandingsRowProps {
  standing: HandballStanding;
}

export function HandballStandingsRow({ standing }: HandballStandingsRowProps) {
  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-xs md:text-sm font-medium">{standing.position}</td>
      <td className="py-2 md:py-3 px-1 md:px-4">
        <div className="flex items-center gap-1 md:gap-3">
          {standing.team.logo && (
            <img 
              src={standing.team.logo} 
              alt={standing.team.name}
              className="w-4 h-4 md:w-6 md:h-6 object-contain flex-shrink-0"
            />
          )}
          <span className="font-medium text-xs md:text-sm truncate">{standing.team.name}</span>
        </div>
      </td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm">{standing.gamesPlayed}</td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm text-green-600">{standing.wins}</td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm text-muted-foreground">{standing.draws}</td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm text-red-600">{standing.loses}</td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm">{standing.scoredPoints}</td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm">{standing.receivedPoints}</td>
      <td className={`py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm font-medium ${getDifferenceColor(standing.pointsDifference)}`}>
        {standing.pointsDifference > 0 ? '+' : ''}{standing.pointsDifference}
      </td>
      <td className="py-2 md:py-3 px-0.5 md:px-2 text-center text-xs md:text-sm font-bold">{standing.points}</td>
    </tr>
  );
}
