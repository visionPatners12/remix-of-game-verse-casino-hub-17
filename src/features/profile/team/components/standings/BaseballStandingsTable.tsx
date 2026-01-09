import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { cn } from '@/lib/utils';

interface BaseballStandingsTableProps {
  standings: TeamStandingDisplay[];
  teamId: string;
}

export function BaseballStandingsTable({ standings, teamId }: BaseballStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-semibold">#</th>
            <th className="text-center p-2 font-semibold">W</th>
            <th className="text-center p-2 font-semibold">L</th>
            <th className="text-center p-2 font-semibold">PCT</th>
            {standings.some(s => s.games_behind !== undefined) && (
              <th className="text-center p-2 font-semibold">GB</th>
            )}
            <th className="text-center p-2 font-semibold">RS</th>
            <th className="text-center p-2 font-semibold">RA</th>
            <th className="text-center p-2 font-semibold">DIFF</th>
            {standings.some(s => s.streak) && (
              <th className="text-center p-2 font-semibold">STR</th>
            )}
            {standings.some(s => s.last_ten) && (
              <th className="text-center p-2 font-semibold">L10</th>
            )}
            {standings.some(s => s.home_record) && (
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
              <td className="text-center p-2 text-green-600 font-medium">{standing.wins}</td>
              <td className="text-center p-2 text-red-600 font-medium">{standing.losses}</td>
              <td className="text-center p-2 font-medium">
                {standing.win_pct ? (standing.win_pct * 100).toFixed(1) + '%' : '-'}
              </td>
              {standings.some(s => s.games_behind !== undefined) && (
                <td className="text-center p-2 text-muted-foreground">
                  {standing.games_behind === 0 ? '-' : standing.games_behind}
                </td>
              )}
              <td className="text-center p-2">{standing.runs_scored || 0}</td>
              <td className="text-center p-2">{standing.runs_allowed || 0}</td>
              <td className={cn(
                "text-center p-2 font-medium",
                standing.run_differential && standing.run_differential > 0 ? "text-green-600" :
                standing.run_differential && standing.run_differential < 0 ? "text-red-600" :
                "text-muted-foreground"
              )}>
                {standing.run_differential && standing.run_differential > 0 ? '+' : ''}{standing.run_differential || 0}
              </td>
              {standings.some(s => s.streak) && (
                <td className="text-center p-2 text-xs font-medium">{standing.streak || '-'}</td>
              )}
              {standings.some(s => s.last_ten) && (
                <td className="text-center p-2 text-xs text-muted-foreground">{standing.last_ten || '-'}</td>
              )}
              {standings.some(s => s.home_record) && (
                <>
                  <td className="text-center p-2 text-xs text-muted-foreground">
                    {standing.home_record || '-'}
                  </td>
                  <td className="text-center p-2 text-xs text-muted-foreground">
                    {standing.road_record || '-'}
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
