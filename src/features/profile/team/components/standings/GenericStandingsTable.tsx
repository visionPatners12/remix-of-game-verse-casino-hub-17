import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { cn } from '@/lib/utils';

interface GenericStandingsTableProps {
  standings: TeamStandingDisplay[];
  teamId: string;
}

export function GenericStandingsTable({ standings, teamId }: GenericStandingsTableProps) {
  // Detect if we have sets (volleyball) or points (rugby/handball)
  const hasSets = standings.some(s => s.sets_won !== undefined);
  const hasPointsScored = standings.some(s => s.scored_points !== undefined);
  
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
            {hasSets ? (
              <>
                <th className="text-center p-2 font-semibold">SW</th>
                <th className="text-center p-2 font-semibold">SL</th>
                <th className="text-center p-2 font-semibold">+/-</th>
              </>
            ) : (
              <>
                <th className="text-center p-2 font-semibold">PF</th>
                <th className="text-center p-2 font-semibold">PA</th>
                <th className="text-center p-2 font-semibold">+/-</th>
              </>
            )}
            <th className="text-center p-2 font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => {
            const difference = hasSets 
              ? (standing.sets_difference || 0)
              : hasPointsScored 
                ? (standing.points_difference || 0)
                : standing.goal_difference;
                
            return (
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
                <td className="text-center p-2 text-muted-foreground">{standing.draws || 0}</td>
                <td className="text-center p-2 text-red-600">{standing.losses}</td>
                {hasSets ? (
                  <>
                    <td className="text-center p-2">{standing.sets_won || 0}</td>
                    <td className="text-center p-2">{standing.sets_lost || 0}</td>
                  </>
                ) : (
                  <>
                    <td className="text-center p-2">{standing.scored_points || standing.goals_for}</td>
                    <td className="text-center p-2">{standing.received_points || standing.goals_against}</td>
                  </>
                )}
                <td className={cn(
                  "text-center p-2 font-medium",
                  difference > 0 ? "text-green-600" :
                  difference < 0 ? "text-red-600" :
                  "text-muted-foreground"
                )}>
                  {difference > 0 ? '+' : ''}{difference}
                </td>
                <td className="text-center p-2 font-bold">{standing.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
