import { HockeyStanding } from '@/types/standings/hockey';
import { Avatar, AvatarImage, AvatarFallback } from '@/ui';

interface HockeyStandingsRowProps {
  standing: HockeyStanding;
}

export function HockeyStandingsRow({ standing }: HockeyStandingsRowProps) {
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
    <tr className="border-b border-border/20 hover:bg-muted/50 transition-colors relative">
      {standing.description && (
        <td className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}
      
      <td className="px-1 md:px-2 py-2 md:py-3 text-[10px] md:text-xs font-medium text-foreground">
        {standing.position || '-'}
      </td>
      
      <td className="px-1 md:px-2 py-2 md:py-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5 md:w-8 md:h-8">
            <AvatarImage src={standing.team.logo} alt={standing.team.name} />
            <AvatarFallback className="text-[8px] md:text-xs">
              {standing.team.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] md:text-sm font-medium text-foreground truncate">
            {standing.team.name}
          </span>
        </div>
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm text-foreground">
        {standing.gamesPlayed || '-'}
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm text-foreground">
        {standing.wins || '-'}
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm text-foreground">
        {standing.losses || '-'}
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm text-foreground">
        {standing.overtimeLosses || '-'}
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm font-bold text-foreground">
        {standing.points || '-'}
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm text-foreground">
        {standing.goalsFor || '-'}
      </td>
      
      <td className="text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm text-foreground">
        {standing.goalsAgainst || '-'}
      </td>
      
      <td className={`text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm font-medium ${getDifferenceColor(standing.goalDifference)}`}>
        {standing.goalDifference !== 0 ? formatDifference(standing.goalDifference) : '-'}
      </td>

      <td className={`text-center px-1 md:px-2 py-2 md:py-3 text-[11px] md:text-sm font-medium ${getStreakColor(standing.streak)}`}>
        {standing.streak || '-'}
      </td>
    </tr>
  );
}
