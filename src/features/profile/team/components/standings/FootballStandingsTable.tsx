import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { cn } from '@/lib/utils';

interface FootballStandingsTableProps {
  standings: TeamStandingDisplay[];
  teamId: string;
}

export function FootballStandingsTable({ standings, teamId }: FootballStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-semibold">#</th>
            <th className="text-center p-2 font-semibold">GP</th>
            <th className="text-center p-2 font-semibold">W</th>
            <th className="text-center p-2 font-semibold">D</th>
            <th className="text-center p-2 font-semibold">L</th>
            <th className="text-center p-2 font-semibold">GF</th>
            <th className="text-center p-2 font-semibold">GA</th>
            <th className="text-center p-2 font-semibold">+/-</th>
            <th className="text-center p-2 font-semibold">Pts</th>
            {standings.some(s => s.hasHomeAwayStats) && (
              <>
                <th className="text-center p-2 font-semibold">🏠</th>
                <th className="text-center p-2 font-semibold">✈️</th>
              </>
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
              <td className="text-center p-2">{standing.played}</td>
              <td className="text-center p-2 text-green-600">{standing.wins}</td>
              <td className="text-center p-2 text-muted-foreground">{standing.draws}</td>
              <td className="text-center p-2 text-red-600">{standing.losses}</td>
              <td className="text-center p-2">{standing.goals_for}</td>
              <td className="text-center p-2">{standing.goals_against}</td>
              <td className={cn(
                "text-center p-2 font-medium",
                standing.goal_difference > 0 ? "text-green-600" :
                standing.goal_difference < 0 ? "text-red-600" :
                "text-muted-foreground"
              )}>
                {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
              </td>
              <td className="text-center p-2 font-bold">{standing.points}</td>
              {standing.hasHomeAwayStats && (
                <>
                  <td className="text-center p-2 text-xs text-muted-foreground">
                    {standing.home_wins}-{standing.home_draws}-{standing.home_losses}
                  </td>
                  <td className="text-center p-2 text-xs text-muted-foreground">
                    {standing.away_wins}-{standing.away_draws}-{standing.away_losses}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
