import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';
import { getStatString, getStatNumber } from '@/utils/standings/getStatFromArray';

interface NHLStatsCardProps {
  standing: TeamStandingDisplay;
}

export function NHLStatsCard({ standing }: NHLStatsCardProps) {
  const stats = standing.raw_stats?.statistics || [];
  
  // Extract stats from array format
  const gamesPlayed = getStatNumber(stats, 'Games Played');
  const wins = getStatNumber(stats, 'Wins');
  const losses = getStatNumber(stats, 'Losses');
  const otLosses = getStatNumber(stats, 'Overtime Losses');
  const points = getStatNumber(stats, 'Points');
  const goalsFor = getStatNumber(stats, 'Goals For');
  const goalsAgainst = getStatNumber(stats, 'Goals Against');
  const goalDiff = getStatNumber(stats, 'Goal Differential');
  const regWins = getStatNumber(stats, 'Regulation Wins') || getStatNumber(stats, 'RW');
  const homeRecord = getStatString(stats, 'Home Record');
  const roadRecord = getStatString(stats, 'Road Record');
  const streak = getStatString(stats, 'Streak');
  
  // Calculate diff if not provided
  const diff = goalDiff || (goalsFor - goalsAgainst);
  const diffDisplay = diff > 0 ? `+${diff}` : String(diff);

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
              <th className="py-1.5 px-2 text-left font-medium">GP</th>
              <th className="py-1.5 px-2 text-center font-medium">W</th>
              <th className="py-1.5 px-2 text-center font-medium">L</th>
              <th className="py-1.5 px-2 text-center font-medium">OTL</th>
              <th className="py-1.5 px-2 text-center font-medium">PTS</th>
              <th className="py-1.5 px-2 text-center font-medium">GF</th>
              <th className="py-1.5 px-2 text-center font-medium">GA</th>
              <th className="py-1.5 px-2 text-center font-medium">DIFF</th>
              <th className="py-1.5 px-2 text-center font-medium">STRK</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-muted/30">
              <td className="py-2 px-2">{gamesPlayed || '-'}</td>
              <td className="py-2 px-2 text-center font-semibold">{wins}</td>
              <td className="py-2 px-2 text-center">{losses}</td>
              <td className="py-2 px-2 text-center">{otLosses}</td>
              <td className="py-2 px-2 text-center font-bold">{points}</td>
              <td className="py-2 px-2 text-center">{goalsFor || '-'}</td>
              <td className="py-2 px-2 text-center">{goalsAgainst || '-'}</td>
              <td className={`py-2 px-2 text-center font-medium ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : ''}`}>
                {goalsFor || goalsAgainst ? diffDisplay : '-'}
              </td>
              <td className={`py-2 px-2 text-center font-medium ${streak.startsWith('W') ? 'text-emerald-500' : streak.startsWith('L') ? 'text-red-500' : ''}`}>
                {streak || '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Home/Road Records */}
      {(homeRecord || roadRecord || regWins > 0) && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          {homeRecord && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">Home</div>
              <div className="text-xs font-medium">{homeRecord}</div>
            </div>
          )}
          {roadRecord && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">Road</div>
              <div className="text-xs font-medium">{roadRecord}</div>
            </div>
          )}
          {regWins > 0 && (
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase">RW</div>
              <div className="text-xs font-medium">{regWins}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
