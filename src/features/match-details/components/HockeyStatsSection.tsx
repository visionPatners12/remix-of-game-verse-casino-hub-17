import React, { memo } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { useMatchData } from '../hooks/useMatchData';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface HockeyStatsSectionProps {
  match: SupabaseMatchData;
}

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
}

const StatBar = memo(function StatBar({ label, homeValue, awayValue }: StatBarProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{homeValue}</span>
        <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
        <span className="font-medium text-foreground">{awayValue}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
        <div 
          className="bg-primary transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-muted-foreground/40 transition-all duration-500"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
});

// NHL stat labels mapping
const statLabels: Record<string, string> = {
  'Blocked Shots': 'Blocked Shots',
  'Faceoff Wins': 'Faceoff Wins',
  'Giveaways': 'Giveaways',
  'Hits': 'Hits',
  'Penalty Minutes': 'Penalty Minutes',
  'Power Play Goals': 'Power Play Goals',
  'Power Play Opportunities': 'Power Play Opportunities',
  'Shots': 'Shots',
  'Takeaways': 'Takeaways',
};

// Priority order for stats display
const priorityStats = [
  'Shots',
  'Hits',
  'Blocked Shots',
  'Faceoff Wins',
  'Power Play Goals',
  'Power Play Opportunities',
  'Takeaways',
  'Giveaways',
  'Penalty Minutes',
];

export const HockeyStatsSection = memo(function HockeyStatsSection({ match }: HockeyStatsSectionProps) {
  const { data, isLoading, error } = useMatchData(match.id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p className="text-sm">Unable to load statistics</p>
      </div>
    );
  }

  const rawStatistics = data?.statistics;
  
  // Check for valid statistics format
  if (!rawStatistics || Array.isArray(rawStatistics)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Statistics</h3>
        <p className="text-sm">Statistics not available for this match</p>
      </div>
    );
  }

  const statistics = rawStatistics as { home: Record<string, string>; away: Record<string, string> };
  if (!statistics.home && !statistics.away) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Statistics</h3>
        <p className="text-sm">Statistics not available for this match</p>
      </div>
    );
  }

  // Create a map of all stats
  const homeStats = statistics.home || {};
  const awayStats = statistics.away || {};
  const statsMap = new Map<string, { home: number; away: number }>();

  Object.entries(homeStats).forEach(([key, value]) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    statsMap.set(key, { home: numValue || 0, away: 0 });
  });

  Object.entries(awayStats).forEach(([key, value]) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    const existing = statsMap.get(key);
    if (existing) {
      existing.away = numValue || 0;
    } else {
      statsMap.set(key, { home: 0, away: numValue || 0 });
    }
  });

  // Sort stats by priority
  const sortedStats = Array.from(statsMap.entries()).sort((a, b) => {
    const aIndex = priorityStats.indexOf(a[0]);
    const bIndex = priorityStats.indexOf(b[0]);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const homeName = match.home_team?.name || match.home;
  const awayName = match.away_team?.name || match.away;
  const homeLogo = match.home_team?.logo;
  const awayLogo = match.away_team?.logo;

  return (
    <div className="space-y-6 p-4">
      {/* Team headers */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          {homeLogo && (
            <img 
              src={homeLogo} 
              alt={homeName}
              className="w-8 h-8 object-contain"
            />
          )}
          <span className="font-semibold text-sm">{homeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{awayName}</span>
          {awayLogo && (
            <img 
              src={awayLogo} 
              alt={awayName}
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </div>

      {/* Stats bars */}
      <div className="space-y-4">
        {sortedStats.map(([type, values]) => (
          <StatBar
            key={type}
            label={statLabels[type] || type}
            homeValue={values.home}
            awayValue={values.away}
          />
        ))}
      </div>
    </div>
  );
});
