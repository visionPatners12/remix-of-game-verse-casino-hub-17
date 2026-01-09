import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';
import { getStatFromArray, getStatString, getStatNumber } from '@/utils/standings/getStatFromArray';

interface NBAStatsCardProps {
  standing: TeamStandingDisplay;
}

export function NBAStatsCard({ standing }: NBAStatsCardProps) {
  const stats = standing.raw_stats?.statistics || [];
  
  // Extract stats from array format
  const wins = getStatNumber(stats, 'Wins');
  const losses = getStatNumber(stats, 'Losses');
  const winPct = getStatString(stats, 'Win Percentage') || getStatString(stats, 'PCT');
  const overall = getStatString(stats, 'Overall');
  const home = getStatString(stats, 'Home');
  const road = getStatString(stats, 'Road');
  const div = getStatString(stats, 'DIV');
  const conf = getStatString(stats, 'CONF');
  const lastTen = getStatString(stats, 'Last Ten Games') || getStatString(stats, 'L10');
  const streak = getStatString(stats, 'Streak') || getStatString(stats, 'STRK');
  const gamesBehind = getStatFromArray(stats, 'Games Back') ?? getStatFromArray(stats, 'GB');
  const ppg = getStatString(stats, 'PPG');
  const oppPpg = getStatString(stats, 'Opp PPG') || getStatString(stats, 'OPP PPG');
  
  // Calculate differential if PPG values available
  const ppgNum = parseFloat(ppg) || 0;
  const oppPpgNum = parseFloat(oppPpg) || 0;
  const diff = ppgNum - oppPpgNum;
  const diffDisplay = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="text-base font-semibold">{standing.stage || 'Regular Season'}</h3>
        <div className="flex items-center gap-2">
          {standing.conference && (
            <span className="text-xs text-muted-foreground">{standing.conference}</span>
          )}
          {standing.division && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{standing.division}</span>
          )}
        </div>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="py-1.5 px-2 text-left font-medium">W-L</th>
              <th className="py-1.5 px-2 text-center font-medium">PCT</th>
              <th className="py-1.5 px-2 text-center font-medium">GB</th>
              <th className="py-1.5 px-2 text-center font-medium">PPG</th>
              <th className="py-1.5 px-2 text-center font-medium">OPP</th>
              <th className="py-1.5 px-2 text-center font-medium">DIFF</th>
              <th className="py-1.5 px-2 text-center font-medium">L10</th>
              <th className="py-1.5 px-2 text-center font-medium">STRK</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-muted/30">
              <td className="py-2 px-2 font-semibold">{wins}-{losses}</td>
              <td className="py-2 px-2 text-center">{winPct || '-'}</td>
              <td className="py-2 px-2 text-center">{gamesBehind ?? '-'}</td>
              <td className="py-2 px-2 text-center">{ppg || '-'}</td>
              <td className="py-2 px-2 text-center">{oppPpg || '-'}</td>
              <td className={`py-2 px-2 text-center font-medium ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : ''}`}>
                {ppg ? diffDisplay : '-'}
              </td>
              <td className="py-2 px-2 text-center">{lastTen || '-'}</td>
              <td className={`py-2 px-2 text-center font-medium ${streak.startsWith('W') ? 'text-emerald-500' : streak.startsWith('L') ? 'text-red-500' : ''}`}>
                {streak || '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Home/Road Records */}
      {(home || road || div || conf) && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
          {home && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">Home</div>
              <div className="text-xs font-medium">{home}</div>
            </div>
          )}
          {road && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">Road</div>
              <div className="text-xs font-medium">{road}</div>
            </div>
          )}
          {div && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">DIV</div>
              <div className="text-xs font-medium">{div}</div>
            </div>
          )}
          {conf && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">CONF</div>
              <div className="text-xs font-medium">{conf}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
