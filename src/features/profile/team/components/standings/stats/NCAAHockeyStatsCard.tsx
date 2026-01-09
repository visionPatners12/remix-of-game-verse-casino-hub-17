import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';
import { getStatString, getStatNumber } from '@/utils/standings/getStatFromArray';

interface NCAAHockeyStatsCardProps {
  standing: TeamStandingDisplay;
}

export function NCAAHockeyStatsCard({ standing }: NCAAHockeyStatsCardProps) {
  const rawStats = standing.raw_stats || {};
  
  // NCAA Hockey may use array or object format
  const hasStatsArray = Array.isArray(rawStats.statistics);
  
  let gamesPlayed: number;
  let wins: number;
  let losses: number;
  let ties: number;
  let winPct: string;
  let overall: string;
  let streak: string;
  let goalsFor: number;
  let goalsAgainst: number;
  
  if (hasStatsArray) {
    const stats = rawStats.statistics;
    gamesPlayed = getStatNumber(stats, 'Games Played');
    wins = getStatNumber(stats, 'Wins');
    losses = getStatNumber(stats, 'Losses');
    ties = getStatNumber(stats, 'Ties') || getStatNumber(stats, 'OT');
    winPct = getStatString(stats, 'Win Percentage') || getStatString(stats, 'PCT');
    overall = getStatString(stats, 'Overall');
    streak = getStatString(stats, 'Streak');
    goalsFor = getStatNumber(stats, 'Goals For');
    goalsAgainst = getStatNumber(stats, 'Goals Against');
  } else {
    // Object format fallback
    gamesPlayed = rawStats.gamesPlayed ?? 0;
    wins = rawStats.wins ?? 0;
    losses = rawStats.loses ?? 0;
    ties = rawStats.ties ?? rawStats.otLosses ?? 0;
    goalsFor = rawStats.scoredGoals ?? 0;
    goalsAgainst = rawStats.receivedGoals ?? 0;
    overall = rawStats.overall ?? `${wins}-${losses}${ties ? `-${ties}` : ''}`;
    streak = rawStats.streak ?? '';
    winPct = gamesPlayed > 0 ? (wins / gamesPlayed).toFixed(3) : '.000';
  }

  const diff = goalsFor - goalsAgainst;
  const diffDisplay = diff > 0 ? `+${diff}` : String(diff);

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
              <th className="py-1.5 px-2 text-left font-medium">Record</th>
              <th className="py-1.5 px-2 text-center font-medium">GP</th>
              <th className="py-1.5 px-2 text-center font-medium">W</th>
              <th className="py-1.5 px-2 text-center font-medium">L</th>
              {ties > 0 && <th className="py-1.5 px-2 text-center font-medium">T</th>}
              <th className="py-1.5 px-2 text-center font-medium">PCT</th>
              <th className="py-1.5 px-2 text-center font-medium">GF</th>
              <th className="py-1.5 px-2 text-center font-medium">GA</th>
              <th className="py-1.5 px-2 text-center font-medium">DIFF</th>
              {streak && <th className="py-1.5 px-2 text-center font-medium">STRK</th>}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-muted/30">
              <td className="py-2 px-2 font-semibold">{overall || `${wins}-${losses}`}</td>
              <td className="py-2 px-2 text-center">{gamesPlayed || '-'}</td>
              <td className="py-2 px-2 text-center font-semibold">{wins}</td>
              <td className="py-2 px-2 text-center">{losses}</td>
              {ties > 0 && <td className="py-2 px-2 text-center">{ties}</td>}
              <td className="py-2 px-2 text-center">{winPct || '-'}</td>
              <td className="py-2 px-2 text-center">{goalsFor || '-'}</td>
              <td className="py-2 px-2 text-center">{goalsAgainst || '-'}</td>
              <td className={`py-2 px-2 text-center font-medium ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : ''}`}>
                {goalsFor || goalsAgainst ? diffDisplay : '-'}
              </td>
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
