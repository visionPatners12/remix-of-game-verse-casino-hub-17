import { PlayerStats } from '../types/player';
import { TrendingUp } from 'lucide-react';

interface PlayerSeasonHighlightsProps {
  stats: PlayerStats | null;
}

// Priority stats for basketball (most common sport)
const BASKETBALL_PRIORITY = [
  'Points Per Game',
  'Rebounds Per Game', 
  'Assists Per Game',
  'Field Goal %',
  'Field Goal Percentage',
  'FG%',
];

// Generic priority stats
const GENERIC_PRIORITY = [
  'Games Played',
  'Minutes Per Game',
  'Total Points',
  'Goals',
  'Assists',
];

// Short names for display
const SHORT_NAMES: Record<string, string> = {
  'Points Per Game': 'PPG',
  'Rebounds Per Game': 'RPG',
  'Assists Per Game': 'APG',
  'Field Goal %': 'FG%',
  'Field Goal Percentage': 'FG%',
  'Games Played': 'GP',
  'Minutes Per Game': 'MPG',
  'Total Points': 'PTS',
  'Steals Per Game': 'SPG',
  'Blocks Per Game': 'BPG',
  'Free Throw %': 'FT%',
  'Free Throw Percentage': 'FT%',
  '3-Point %': '3P%',
  'Three Point %': '3P%',
};

export function PlayerSeasonHighlights({ stats }: PlayerSeasonHighlightsProps) {
  if (!stats?.perSeason?.length) return null;

  // Get the most recent season - sort by year descending, prefer "Entire" breakdown
  const sortedSeasons = [...stats.perSeason].sort((a, b) => {
    if (b.season !== a.season) return b.season - a.season;
    // Prefer "Entire" over "Season" for same year
    if (a.seasonBreakdown === 'Entire' && b.seasonBreakdown !== 'Entire') return -1;
    if (b.seasonBreakdown === 'Entire' && a.seasonBreakdown !== 'Entire') return 1;
    return 0;
  });
  
  const latestSeason = sortedSeasons[0];
  
  if (!latestSeason?.stats?.length) return null;

  // Find priority stats
  const priorityOrder = [...BASKETBALL_PRIORITY, ...GENERIC_PRIORITY];
  
  const sortedStats = [...latestSeason.stats].sort((a, b) => {
    const aIndex = priorityOrder.findIndex(p => 
      a.name.toLowerCase().includes(p.toLowerCase())
    );
    const bIndex = priorityOrder.findIndex(p => 
      b.name.toLowerCase().includes(p.toLowerCase())
    );
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const displayStats = sortedStats.slice(0, 4);

  if (displayStats.length === 0) return null;

  const formatValue = (value: number, name: string): string => {
    // Percentages
    if (name.includes('%') || name.toLowerCase().includes('percentage')) {
      return `${value.toFixed(1)}%`;
    }
    // Integers
    if (value % 1 === 0) {
      return value.toString();
    }
    // Decimals
    return value.toFixed(1);
  };

  const getShortName = (name: string): string => {
    return SHORT_NAMES[name] || name;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {latestSeason.season} Season
        </h3>
        {latestSeason.teams?.[0] && (
          <span className="text-xs text-muted-foreground">
            • {latestSeason.teams[0].abbreviation || latestSeason.teams[0].name}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {displayStats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-muted/30 rounded-lg p-3 text-center"
          >
            <div className="text-lg font-bold text-foreground tabular-nums">
              {formatValue(stat.value, stat.name)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
              {getShortName(stat.name)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
