import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface NFLStatsCardProps {
  standing: TeamStandingDisplay;
}

export function NFLStatsCard({ standing }: NFLStatsCardProps) {
  const stats = standing.raw_stats || {};

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
              <td className="py-1.5 px-2 text-right">{stats.wins ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Losses</td>
              <td className="py-1.5 px-2 text-right">{stats.losses ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Ties</td>
              <td className="py-1.5 px-2 text-right">{stats.ties ?? 0}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Win %</td>
              <td className="py-1.5 px-2 text-right">{stats.win_percentage ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Overall</td>
              <td className="py-1.5 px-2 text-right" colSpan={3}>{stats.overall_record ?? '-'}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Home</td>
              <td className="py-1.5 px-2 text-right">{stats.home_record ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Road</td>
              <td className="py-1.5 px-2 text-right" colSpan={3}>{stats.road_record ?? '-'}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Points For</td>
              <td className="py-1.5 px-2 text-right">{stats.points_for ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Points Against</td>
              <td className="py-1.5 px-2 text-right">{stats.points_against ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Differential</td>
              <td className="py-1.5 px-2 text-right font-semibold">{stats.differential ?? stats.point_differential ?? '-'}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Division</td>
              <td className="py-1.5 px-2 text-right">{stats.division_record ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Division W-L</td>
              <td className="py-1.5 px-2 text-right" colSpan={3}>{stats.division_wins ?? 0}-{stats.division_losses ?? 0}-{stats.division_ties ?? 0}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">vs Division</td>
              <td className="py-1.5 px-2 text-right">{stats.versus_division ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">vs Conference</td>
              <td className="py-1.5 px-2 text-right" colSpan={3}>{stats.versus_conference ?? '-'}</td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Playoff Seed</td>
              <td className="py-1.5 px-2 text-right">{stats.playoff_seed ? `#${stats.playoff_seed}` : '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Games Behind</td>
              <td className="py-1.5 px-2 text-right">{stats.games_behind ?? '-'}</td>
              <td className="py-1.5 px-2 font-medium text-muted-foreground">Streak</td>
              <td className="py-1.5 px-2 text-right font-semibold">{stats.streak ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
