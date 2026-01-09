import { BasketballStanding } from '@/types/standings/basketball';
import { useNavigate } from 'react-router-dom';

interface NBAStandingsRowProps {
  standing: BasketballStanding;
}

// Helper to get stat value from statistics[] array - supports both 'name' and 'displayName'
function getStatValue(statistics: Array<{ name?: string; displayName?: string; value: string | number }> | undefined, statName: string): string {
  if (!statistics) return '-';
  const stat = statistics.find(s => s.name === statName || s.displayName === statName);
  return stat ? String(stat.value) : '-';
}

export function NBAStandingsRow({ standing }: NBAStandingsRowProps) {
  const navigate = useNavigate();
  
  // Parse statistics array from raw_stats
  const statistics = (standing as any).raw_stats?.statistics as Array<{ displayName: string; value: string | number }> | undefined;

  const handleTeamClick = () => {
    if (standing.team.slug) {
      navigate(`/team/${standing.team.id}`);
    }
  };

  const overall = getStatValue(statistics, 'Overall');
  const winPct = getStatValue(statistics, 'Win Percentage');
  const ppg = getStatValue(statistics, 'Points Per Game');
  const oppPpg = getStatValue(statistics, 'Opponent Points Per Game');
  const streak = getStatValue(statistics, 'Streak');

  const getStreakColor = (streak: string): string => {
    if (streak.startsWith('W') || streak.startsWith('V')) return 'text-green-600';
    if (streak.startsWith('L')) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-xs font-semibold text-muted-foreground">
          {standing.position}
        </span>
      </td>
      <td className="px-1.5 md:px-4 py-2 md:py-3">
        <div 
          className="flex items-center gap-1.5 md:gap-3 cursor-pointer hover:opacity-80"
          onClick={handleTeamClick}
        >
          <img 
            src={standing.team.logo} 
            alt={standing.team.name}
            className="w-5 h-5 md:w-8 md:h-8 object-contain flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <span className="font-semibold text-[10px] md:text-sm text-foreground truncate max-w-[70px] md:max-w-none">
            {standing.team.name}
          </span>
        </div>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {overall}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {winPct}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {ppg}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className="text-[10px] md:text-sm font-semibold text-foreground">
          {oppPpg}
        </span>
      </td>
      <td className="px-1 md:px-2 py-2 md:py-3 text-center">
        <span className={`text-[10px] md:text-sm font-semibold ${getStreakColor(streak)}`}>
          {streak}
        </span>
      </td>
    </tr>
  );
}
