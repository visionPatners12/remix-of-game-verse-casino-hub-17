import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface NCAABasketballStatsCardProps {
  standing: TeamStandingDisplay;
}

export function NCAABasketballStatsCard({ standing }: NCAABasketballStatsCardProps) {
  const stats = standing.raw_stats || {};
  
  // NCAA Basketball uses direct object format, not array
  const wins = stats.wins ?? 0;
  const losses = stats.loses ?? 0;
  const gamesPlayed = stats.gamesPlayed ?? (wins + losses);
  const scoredPoints = stats.scoredPoints ?? 0;
  const receivedPoints = stats.receivedPoints ?? 0;
  const diff = scoredPoints - receivedPoints;
  const winPct = gamesPlayed > 0 ? (wins / gamesPlayed).toFixed(3) : '.000';
  const gamesBehind = stats.gamesBehind;
  const streak = stats.streak ?? '';
  const overall = stats.overall ?? `${wins}-${losses}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="text-base font-semibold">{standing.stage || 'Regular Season'}</h3>
        {standing.conference && (
          <span className="text-xs text-muted-foreground">{standing.conference}</span>
        )}
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="py-1.5 px-2 text-left font-medium">W-L</th>
              <th className="py-1.5 px-2 text-center font-medium">GP</th>
              <th className="py-1.5 px-2 text-center font-medium">PCT</th>
              <th className="py-1.5 px-2 text-center font-medium">PF</th>
              <th className="py-1.5 px-2 text-center font-medium">PA</th>
              <th className="py-1.5 px-2 text-center font-medium">DIFF</th>
              {gamesBehind !== undefined && (
                <th className="py-1.5 px-2 text-center font-medium">GB</th>
              )}
              {streak && (
                <th className="py-1.5 px-2 text-center font-medium">STRK</th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-muted/30">
              <td className="py-2 px-2 font-semibold">{wins}-{losses}</td>
              <td className="py-2 px-2 text-center">{gamesPlayed}</td>
              <td className="py-2 px-2 text-center">{winPct}</td>
              <td className="py-2 px-2 text-center">{scoredPoints}</td>
              <td className="py-2 px-2 text-center">{receivedPoints}</td>
              <td className={`py-2 px-2 text-center font-medium ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : ''}`}>
                {diff > 0 ? `+${diff}` : diff}
              </td>
              {gamesBehind !== undefined && (
                <td className="py-2 px-2 text-center">{gamesBehind}</td>
              )}
              {streak && (
                <td className={`py-2 px-2 text-center font-medium ${streak.startsWith('W') ? 'text-emerald-500' : streak.startsWith('L') ? 'text-red-500' : ''}`}>
                  {streak}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
