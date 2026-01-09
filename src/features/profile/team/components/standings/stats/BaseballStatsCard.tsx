import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface BaseballStatsCardProps {
  standing: TeamStandingDisplay;
}

export function BaseballStatsCard({ standing }: BaseballStatsCardProps) {
  const stats = standing.raw_stats || {};
  const wins = stats.w || stats.wins || 0;
  const losses = stats.l || stats.loses || 0;
  const gamesPlayed = stats.gp || stats.gamesPlayed || 0;
  const winPct = stats.pct || stats.winPct || (gamesPlayed ? (wins / gamesPlayed).toFixed(3) : '0.000');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="text-base font-semibold">{standing.stage || 'Season'}</h3>
        {standing.division && (
          <span className="text-xs text-muted-foreground">{standing.division}</span>
        )}
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Wins</td>
              <td className="py-1.5 px-2 text-right">{wins}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Losses</td>
              <td className="py-1.5 px-2 text-right">{losses}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Games</td>
              <td className="py-1.5 px-2 text-right">{gamesPlayed}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">PCT</td>
              <td className="py-1.5 px-2 text-right font-semibold">{winPct}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Runs Scored</td>
              <td className="py-1.5 px-2 text-right">{stats.rs || stats.runsScored || 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Runs Allowed</td>
              <td className="py-1.5 px-2 text-right">{stats.ra || stats.runsAllowed || 0}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Run Diff</td>
              <td className="py-1.5 px-2 text-right font-semibold" colSpan={3}>
                {stats.diff || stats.runDifferential || 0}
              </td>
            </tr>
            {(stats.home || stats.homeRecord || stats.away || stats.awayRecord) && (
              <tr className="hover:bg-muted/30">
                <td className="py-1.5 px-2 font-medium text-muted-foreground">Home</td>
                <td className="py-1.5 px-2 text-right">{stats.home || stats.homeRecord || '-'}</td>
                <td className="py-1.5 px-2 font-medium text-muted-foreground">Away</td>
                <td className="py-1.5 px-2 text-right" colSpan={5}>{stats.away || stats.awayRecord || '-'}</td>
              </tr>
            )}
            {(stats.strk || stats.streak || stats.last_ten || stats.lastTen || stats.gb || stats.gamesBehind !== undefined) && (
              <tr className="hover:bg-muted/30">
                {(stats.strk || stats.streak) && (
                  <>
                    <td className="py-1.5 px-2 font-medium text-muted-foreground">Streak</td>
                    <td className="py-1.5 px-2 text-right font-semibold">{stats.strk || stats.streak}</td>
                  </>
                )}
                {(stats.last_ten || stats.lastTen) && (
                  <>
                    <td className="py-1.5 px-2 font-medium text-muted-foreground">Last 10</td>
                    <td className="py-1.5 px-2 text-right">{stats.last_ten || stats.lastTen}</td>
                  </>
                )}
                {(stats.gb || stats.gamesBehind !== undefined) && (
                  <>
                    <td className="py-1.5 px-2 font-medium text-muted-foreground">GB</td>
                    <td className="py-1.5 px-2 text-right" colSpan={3}>{stats.gb || stats.gamesBehind}</td>
                  </>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
