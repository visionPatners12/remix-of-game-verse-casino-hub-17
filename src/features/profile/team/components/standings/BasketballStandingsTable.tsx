import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { cn } from '@/lib/utils';

interface BasketballStandingsTableProps {
  standings: TeamStandingDisplay[];
  teamId: string;
}

export function BasketballStandingsTable({ standings, teamId }: BasketballStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-semibold">#</th>
            <th className="text-center p-2 font-semibold">W</th>
            <th className="text-center p-2 font-semibold">L</th>
            <th className="text-center p-2 font-semibold">PCT</th>
            <th className="text-center p-2 font-semibold">PF</th>
            <th className="text-center p-2 font-semibold">PA</th>
            <th className="text-center p-2 font-semibold">DIFF</th>
            {standings.some(s => s.games_behind !== undefined) && (
              <th className="text-center p-2 font-semibold">GB</th>
            )}
            {standings.some(s => s.streak) && (
              <th className="text-center p-2 font-semibold">STR</th>
            )}
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <tr
              key={standing.id}
              className={cn(
                "border-b border-border/50 hover:bg-accent/50 transition-colors",
                standing.team.id === teamId && "bg-primary/10"
              )}
            >
              <td className="p-2 font-medium">{standing.rank}</td>
              <td className="text-center p-2 text-green-600 font-medium">{standing.wins}</td>
              <td className="text-center p-2 text-red-600 font-medium">{standing.losses}</td>
              <td className="text-center p-2 font-medium">
                {standing.win_pct ? (standing.win_pct * 100).toFixed(1) + '%' : '-'}
              </td>
              <td className="text-center p-2">{standing.scored_points || 0}</td>
              <td className="text-center p-2">{standing.received_points || 0}</td>
              <td className={cn(
                "text-center p-2 font-medium",
                standing.goal_difference > 0 ? "text-green-600" :
                standing.goal_difference < 0 ? "text-red-600" :
                "text-muted-foreground"
              )}>
                {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
              </td>
              {standings.some(s => s.games_behind !== undefined) && (
                <td className="text-center p-2 text-muted-foreground">
                  {standing.games_behind === 0 ? '-' : standing.games_behind}
                </td>
              )}
              {standings.some(s => s.streak) && (
                <td className="text-center p-2 text-xs font-medium">{standing.streak || '-'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
