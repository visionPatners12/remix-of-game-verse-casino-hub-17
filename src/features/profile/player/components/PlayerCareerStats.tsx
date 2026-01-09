import { useState, useMemo } from 'react';
import { PlayerStats, PlayerSeasonStats, PlayerStat } from '../types/player';
import { Target, Shield, Activity, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerCareerStatsProps {
  stats: PlayerStats;
}

// Category ordering and icons
const CATEGORY_CONFIG: Record<string, { icon: typeof Activity; order: number }> = {
  'General': { icon: Activity, order: 0 },
  'Offense': { icon: Target, order: 1 },
  'Defense': { icon: Shield, order: 2 },
};

// Priority stats for sorting within each category
const PRIORITY_STATS: Record<string, string[]> = {
  General: ['Games Played', 'Minutes Per Game', 'Player Rating', 'Total Fouls', 'Rebounds', 'Total Rebounds'],
  Offense: ['Points Per Game', 'Total Points', 'Assists Per Game', 'Total Assists', 'Field Goal', '3-Point', 'Free Throw', 'Turnovers', 'Offensive'],
  Defense: ['Steals Per Game', 'Total Steals', 'Blocks Per Game', 'Total Blocks', 'Defensive Rebounds', 'Steal', 'Block'],
};

// Short stat names for mobile
const SHORT_STAT_NAMES: Record<string, string> = {
  'Games Played': 'GP',
  'Minutes Per Game': 'MPG',
  'Points Per Game': 'PPG',
  'Assists Per Game': 'APG',
  'Rebounds Per Game': 'RPG',
  'Field Goal %': 'FG%',
  'Free Throw %': 'FT%',
  '3-Point %': '3P%',
  'Blocks Per Game': 'BPG',
  'Steals Per Game': 'SPG',
  'Total Rebounds': 'TRB',
  'Total Points': 'PTS',
  'Total Assists': 'AST',
  'Total Blocks': 'BLK',
  'Total Steals': 'STL',
  'Defensive Rebounds': 'DRB',
  'Offensive Rebounds': 'ORB',
  'Turnovers Per Game': 'TOV',
  'Player Rating': 'RTG',
  'Total Fouls': 'PF',
  'Double Doubles': 'DD',
  'True Shooting %': 'TS%',
  'Field Goal Percentage': 'FG%',
  'Free Throw Percentage': 'FT%',
  '3-Point Percentage': '3P%',
};

const getStatDisplayName = (name: string, isMobile: boolean): string => {
  if (isMobile) {
    if (SHORT_STAT_NAMES[name]) return SHORT_STAT_NAMES[name];
    // Try partial match for names like "Field Goal %" 
    const key = Object.keys(SHORT_STAT_NAMES).find(k => name.includes(k) || k.includes(name));
    if (key) return SHORT_STAT_NAMES[key];
  }
  return name;
};

// Check if stat is percentage-based
const isPercentageStat = (name: string): boolean => {
  const lowerName = name.toLowerCase();
  return name.includes('%') || 
         lowerName.includes('percentage') ||
         lowerName.includes('ratio') ||
         lowerName.includes('efficiency');
};

// Format stat values intelligently
const formatStatValue = (value: number, name: string): string => {
  if (isPercentageStat(name)) {
    return `${value.toFixed(1)}%`;
  }
  if (value % 1 === 0) return value.toString();
  return value.toFixed(1);
};

// Sort stats by priority within category
const sortStatsByPriority = (stats: PlayerStat[], category: string): PlayerStat[] => {
  const priorities = PRIORITY_STATS[category] || [];
  return [...stats].sort((a, b) => {
    const aIndex = priorities.findIndex(p => a.name.toLowerCase().includes(p.toLowerCase()));
    const bIndex = priorities.findIndex(p => b.name.toLowerCase().includes(p.toLowerCase()));
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

// Chunk stats into rows
const chunkStats = (stats: PlayerStat[], size: number): PlayerStat[][] => {
  const chunks: PlayerStat[][] = [];
  for (let i = 0; i < stats.length; i += size) {
    chunks.push(stats.slice(i, i + size));
  }
  return chunks;
};

// Category Section Component
function StatCategory({ 
  category, 
  stats,
  isMobile
}: { 
  category: string; 
  stats: PlayerStat[];
  isMobile: boolean;
}) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['General'];
  const Icon = config.icon;
  const sortedStats = sortStatsByPriority(stats, category);
  const columnsPerRow = isMobile ? 2 : 3;
  const statRows = chunkStats(sortedStats, columnsPerRow);

  return (
    <div>
      {/* Category Header */}
      <div className="flex items-center gap-2 py-2 border-b border-border">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {category}
        </span>
      </div>
      
      {/* Stats Rows */}
      <div className="divide-y divide-border">
        {statRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex hover:bg-muted/30 transition-colors">
            {row.map((stat, statIndex) => (
              <div key={stat.name} className="flex-1 flex items-center min-w-0">
                {statIndex > 0 && <div className="w-px h-6 bg-border shrink-0" />}
                <div className="flex-1 flex justify-between items-center py-2 px-2 min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate mr-1">
                    {getStatDisplayName(stat.name, isMobile)}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-foreground shrink-0 tabular-nums">
                    {formatStatValue(stat.value, stat.name)}
                  </span>
                </div>
              </div>
            ))}
            {/* Fill empty cells if row is incomplete */}
            {row.length < columnsPerRow && Array.from({ length: columnsPerRow - row.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-1 flex items-center min-w-0">
                <div className="w-px h-6 bg-border shrink-0" />
                <div className="flex-1 py-2 px-2" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
// Season Header Component
function SeasonHeader({ season }: { season: PlayerSeasonStats }) {
  const team = season.teams?.[0];
  
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border">
      <div className="flex items-center gap-2">
        {team?.logo && (
          <img 
            src={team.logo} 
            alt={team.name} 
            className="h-6 w-6 object-contain"
          />
        )}
        <span className="text-sm font-semibold text-foreground">
          {team?.displayName || team?.name || 'Unknown Team'}
        </span>
        {season.teams?.length > 1 && (
          <span className="text-[10px] text-muted-foreground">
            +{season.teams.length - 1}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {season.league}
      </span>
    </div>
  );
}

export function PlayerCareerStats({ stats }: PlayerCareerStatsProps) {
  const isMobile = useIsMobile();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState<'Entire' | 'Season'>('Entire');

  // Group seasons by year
  const seasonsByYear = useMemo(() => {
    if (!stats.perSeason) return {};
    return stats.perSeason.reduce((acc, season) => {
      const year = season.season;
      if (!acc[year]) acc[year] = [];
      acc[year].push(season);
      return acc;
    }, {} as Record<number, PlayerSeasonStats[]>);
  }, [stats.perSeason]);

  // Get sorted years (most recent first)
  const years = useMemo(() => {
    return Object.keys(seasonsByYear).map(Number).sort((a, b) => b - a);
  }, [seasonsByYear]);

  // Initialize selected year
  const currentYear = selectedYear ?? years[0];

  // Get available breakdowns for current year
  const availableBreakdowns = useMemo(() => {
    return seasonsByYear[currentYear]?.map(s => s.seasonBreakdown) || [];
  }, [seasonsByYear, currentYear]);

  // Get current season data
  const currentSeason = useMemo(() => {
    const yearSeasons = seasonsByYear[currentYear] || [];
    return yearSeasons.find(s => s.seasonBreakdown === selectedBreakdown) || yearSeasons[0];
  }, [seasonsByYear, currentYear, selectedBreakdown]);

  // Group stats by category and order them
  const categorizedStats = useMemo(() => {
    if (!currentSeason?.stats) return [];
    
    const grouped = currentSeason.stats.reduce((acc, stat) => {
      const category = stat.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(stat);
      return acc;
    }, {} as Record<string, PlayerStat[]>);

    // Sort categories by order
    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const orderA = CATEGORY_CONFIG[a]?.order ?? 99;
        const orderB = CATEGORY_CONFIG[b]?.order ?? 99;
        return orderA - orderB;
      });
  }, [currentSeason]);

  if (!stats.perSeason || stats.perSeason.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No season statistics available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Season Year Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSelectedYear(year);
              const yearBreakdowns = seasonsByYear[year]?.map(s => s.seasonBreakdown) || [];
              const defaultBreakdown = yearBreakdowns.includes('Entire') ? 'Entire' : (yearBreakdowns[0] as 'Entire' | 'Season') || 'Entire';
              setSelectedBreakdown(defaultBreakdown);
            }}
            className={cn(
              "text-xs px-3 py-1 rounded-full shrink-0 transition-colors",
              currentYear === year 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Season Breakdown Toggle */}
      {availableBreakdowns.length > 1 && (
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => setSelectedBreakdown('Entire')}
            className={cn(
              "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded transition-colors",
              selectedBreakdown === 'Entire' 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Trophy className="h-3 w-3" />
            Full Season
          </button>
          <button
            onClick={() => setSelectedBreakdown('Season')}
            className={cn(
              "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded transition-colors",
              selectedBreakdown === 'Season' 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            Regular
          </button>
        </div>
      )}

      {/* Single breakdown indicator */}
      {availableBreakdowns.length === 1 && (
        <div className="flex justify-center">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {availableBreakdowns[0] === 'Entire' ? (
              <><Trophy className="h-3 w-3" /> Full Season</>
            ) : (
              <><Calendar className="h-3 w-3" /> Regular Season</>
            )}
          </span>
        </div>
      )}

      {/* Season Stats */}
      {currentSeason && (
        <div className="space-y-4">
          {/* Team Header */}
          <SeasonHeader season={currentSeason} />

          {/* Stats by Category */}
          <div className="space-y-4">
            {categorizedStats.map(([category, categoryStats]) => (
              <StatCategory 
                key={category} 
                category={category} 
                stats={categoryStats}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
