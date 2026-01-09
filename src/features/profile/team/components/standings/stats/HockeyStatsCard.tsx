import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface HockeyStatsCardProps {
  standing: TeamStandingDisplay;
}

export function HockeyStatsCard({ standing }: HockeyStatsCardProps) {
  const stats = standing.raw_stats || {};
  const totalPoints = (stats.wins || 0) * 2 + (stats.winsOvertime || 0) + (stats.losesOvertime || 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="text-base font-semibold">{standing.stage || 'Season'}</h3>
        {standing.conference && standing.division && (
          <span className="text-xs text-muted-foreground">
            {standing.conference} - {standing.division}
          </span>
        )}
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Wins</td>
              <td className="py-1.5 px-2 text-right">{stats.wins ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Losses</td>
              <td className="py-1.5 px-2 text-right">{stats.loses ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Games</td>
              <td className="py-1.5 px-2 text-right">{stats.gamesPlayed ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Points</td>
              <td className="py-1.5 px-2 text-right font-semibold">{totalPoints}</td>
            </tr>
            {(stats.winsOvertime || stats.losesOvertime) && (
              <tr className="hover:bg-muted/30">
                <td className="py-1.5 px-2 font-medium text-muted-foreground">OT Wins</td>
                <td className="py-1.5 px-2 text-right">{stats.winsOvertime ?? 0}</td>
                <td className="py-1.5 px-2 font-medium text-muted-foreground">OT Losses</td>
                <td className="py-1.5 px-2 text-right" colSpan={5}>{stats.losesOvertime ?? 0}</td>
              </tr>
            )}
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Goals For</td>
              <td className="py-1.5 px-2 text-right">{stats.scoredGoals ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Goals Against</td>
              <td className="py-1.5 px-2 text-right">{stats.receivedGoals ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Differential</td>
              <td className="py-1.5 px-2 text-right font-semibold" colSpan={3}>
                {(stats.scoredGoals || 0) - (stats.receivedGoals || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
