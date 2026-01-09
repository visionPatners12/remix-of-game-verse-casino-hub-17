import React, { memo, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { MatchDataResponse } from '../hooks/useMatchData';

interface AFStatsSectionProps {
  match: SupabaseMatchData;
  matchData: MatchDataResponse | null | undefined;
  isLoading?: boolean;
}

interface StatBarProps {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  homeTeamName: string;
  awayTeamName: string;
}

// Priority order for AF stats
const PRIORITY_STATS = [
  'Total First Downs',
  'Rushing Yards',
  'Passing Yards',
  'Total Yards',
  'Rushing Attempts',
  'Passing Attempts',
  'Turnovers',
  'Fumbles Lost',
  'Interceptions Thrown',
  'Third Down Efficiency',
  'Fourth Down Efficiency',
  'Penalties',
  'Penalty Yards',
  'Time of Possession',
  'Red Zone Efficiency',
];

const StatBar = memo(function StatBar({ label, homeValue, awayValue, homeTeamName, awayTeamName }: StatBarProps) {
  const homeNum = typeof homeValue === 'string' ? parseFloat(homeValue) || 0 : homeValue;
  const awayNum = typeof awayValue === 'string' ? parseFloat(awayValue) || 0 : awayValue;
  const total = homeNum + awayNum;
  
  const homePercent = total > 0 ? (homeNum / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayNum / total) * 100 : 50;

  return (
    <div className="py-3 border-b border-border/20">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium tabular-nums">{homeValue}</span>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className="text-sm font-medium tabular-nums">{awayValue}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        <div
          className="bg-primary transition-all duration-300"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-muted-foreground/40 transition-all duration-300"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
});

export const AFStatsSection = memo(function AFStatsSection({ 
  match, 
  matchData,
  isLoading 
}: AFStatsSectionProps) {
  const rawStatistics = matchData?.statistics;

  // Parse AF statistics format: { home: { statistics: [...] }, away: { statistics: [...] } }
  // or direct format: { home: {...}, away: {...} }
  const statsMap = useMemo(() => {
    if (!rawStatistics || Array.isArray(rawStatistics)) return [];
    
    const statistics = rawStatistics as { home: any; away: any };
    const homeStats = statistics.home as any;
    const awayStats = statistics.away as any;

    if (!homeStats || !awayStats) return [];

    // Check if it's array format (AF) or object format (Football)
    const homeArray = Array.isArray(homeStats.statistics) ? homeStats.statistics : null;
    const awayArray = Array.isArray(awayStats.statistics) ? awayStats.statistics : null;

    if (homeArray && awayArray) {
      // AF format: array of { name, value }
      const map: { label: string; home: string | number; away: string | number }[] = [];
      
      homeArray.forEach((stat: { name: string; value: string | number }) => {
        const awayStat = awayArray.find((s: { name: string }) => s.name === stat.name);
        map.push({
          label: stat.name,
          home: stat.value,
          away: awayStat?.value ?? 0,
        });
      });

      // Sort by priority
      return map.sort((a, b) => {
        const aIdx = PRIORITY_STATS.findIndex(p => a.label.includes(p));
        const bIdx = PRIORITY_STATS.findIndex(p => b.label.includes(p));
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }

    // Fallback: object format
    const map: { label: string; home: string | number; away: string | number }[] = [];
    Object.keys(homeStats).forEach(key => {
      if (key !== 'statistics') {
        map.push({
          label: key,
          home: homeStats[key],
          away: awayStats[key] ?? 0,
        });
      }
    });
    return map;
  }, [rawStatistics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (statsMap.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Statistics not available
      </div>
    );
  }

  return (
    <div>
      {/* Team Headers */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {match.home_team?.logo && (
            <img src={match.home_team.logo} alt="" className="w-6 h-6 object-contain" />
          )}
          <span className="text-sm font-medium">{match.home_team?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{match.away_team?.name}</span>
          {match.away_team?.logo && (
            <img src={match.away_team.logo} alt="" className="w-6 h-6 object-contain" />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="divide-y divide-border/20">
        {statsMap.map((stat, idx) => (
          <StatBar
            key={idx}
            label={stat.label}
            homeValue={stat.home}
            awayValue={stat.away}
            homeTeamName={match.home_team?.name || 'Home'}
            awayTeamName={match.away_team?.name || 'Away'}
          />
        ))}
      </div>
    </div>
  );
});
