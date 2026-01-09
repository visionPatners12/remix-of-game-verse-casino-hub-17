import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { cn } from '@/lib/utils';

interface NFLStandingsTableProps {
  standings: TeamStandingDisplay[];
  teamId: string;
}

export function NFLStandingsTable({ standings, teamId }: NFLStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-semibold">#</th>
            <th className="text-center p-2 font-semibold">W</th>
            <th className="text-center p-2 font-semibold">L</th>
            <th className="text-center p-2 font-semibold">T</th>
            <th className="text-center p-2 font-semibold">PCT</th>
            <th className="text-center p-2 font-semibold">DIFF</th>
            {standings.some(s => s.streak) && (
              <th className="text-center p-2 font-semibold">STR</th>
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
              <td className="text-center p-2 text-muted-foreground">{standing.ties || 0}</td>
              <td className="text-center p-2 font-medium">
                {standing.win_pct ? (standing.win_pct * 100).toFixed(1) + '%' : '-'}
              </td>
              <td className={cn(
                "text-center p-2 font-medium",
                standing.differential && parseInt(standing.differential) > 0 ? "text-green-600" :
                standing.differential && parseInt(standing.differential) < 0 ? "text-red-600" :
                "text-muted-foreground"
              )}>
                {standing.differential && parseInt(standing.differential) > 0 ? '+' : ''}{standing.differential || '0'}
              </td>
              {standings.some(s => s.streak) && (
                <td className="text-center p-2 text-xs font-medium">{standing.streak || '-'}</td>
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
