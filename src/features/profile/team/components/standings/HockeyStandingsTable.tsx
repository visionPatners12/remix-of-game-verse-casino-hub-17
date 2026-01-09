import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { cn } from '@/lib/utils';

interface HockeyStandingsTableProps {
  standings: TeamStandingDisplay[];
  teamId: string;
}

export function HockeyStandingsTable({ standings, teamId }: HockeyStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-semibold">#</th>
            <th className="text-center p-2 font-semibold">GP</th>
            <th className="text-center p-2 font-semibold">W</th>
            <th className="text-center p-2 font-semibold">L</th>
            <th className="text-center p-2 font-semibold">OTW</th>
            <th className="text-center p-2 font-semibold">OTL</th>
            <th className="text-center p-2 font-semibold">GF</th>
            <th className="text-center p-2 font-semibold">GA</th>
            <th className="text-center p-2 font-semibold">+/-</th>
            <th className="text-center p-2 font-semibold">PTS</th>
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
              <td className="text-center p-2">{standing.played}</td>
              <td className="text-center p-2 text-green-600 font-medium">{standing.wins}</td>
              <td className="text-center p-2 text-red-600 font-medium">{standing.losses}</td>
              <td className="text-center p-2 text-green-600/70">{standing.wins_overtime || 0}</td>
              <td className="text-center p-2 text-red-600/70">{standing.losses_overtime || 0}</td>
              <td className="text-center p-2">{standing.scored_goals || standing.goals_for}</td>
              <td className="text-center p-2">{standing.received_goals || standing.goals_against}</td>
              <td className={cn(
                "text-center p-2 font-medium",
                standing.goal_difference > 0 ? "text-green-600" :
                standing.goal_difference < 0 ? "text-red-600" :
                "text-muted-foreground"
              )}>
                {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
              </td>
              <td className="text-center p-2 font-bold">{standing.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
