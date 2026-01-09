import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface BasketballStatsCardProps {
  standing: TeamStandingDisplay;
}

export function BasketballStatsCard({ standing }: BasketballStatsCardProps) {
  const stats = standing.raw_stats || {};
  const winPct = stats.gamesPlayed 
    ? ((stats.wins || 0) / stats.gamesPlayed).toFixed(3)
    : '0.000';

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
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Win %</td>
              <td className="py-1.5 px-2 text-right font-semibold">{winPct}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Points Scored</td>
              <td className="py-1.5 px-2 text-right">{stats.scoredPoints ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Points Allowed</td>
              <td className="py-1.5 px-2 text-right">{stats.receivedPoints ?? 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Differential</td>
              <td className="py-1.5 px-2 text-right font-semibold" colSpan={3}>
                {(stats.scoredPoints || 0) - (stats.receivedPoints || 0)}
              </td>
            </tr>
            {stats.gamesBehind !== undefined && (
              <tr className="hover:bg-muted/30">
                <td className="py-1.5 px-2 font-medium text-muted-foreground">Games Behind</td>
                <td className="py-1.5 px-2 text-right">{stats.gamesBehind}</td>
                <td className="py-1.5 px-2 font-medium text-muted-foreground">Streak</td>
                <td className="py-1.5 px-2 text-right font-semibold" colSpan={5}>{stats.streak ?? '-'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
