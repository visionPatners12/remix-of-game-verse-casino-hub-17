import React, { memo, useMemo } from 'react';
import { 
  BarChart3, 
  Target,
  CircleDot,
  Crosshair,
  Shield,
  Flag,
  AlertTriangle,
  Hand,
  ArrowRightLeft,
  Users,
  Footprints,
  SquareX,
  Circle
} from 'lucide-react';
import { useMatchData } from '../hooks/useMatchData';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import { MatchDetailsSkeleton } from './MatchDetailsSkeleton';
import { cn } from '@/lib/utils';

interface MatchStatsSectionProps {
  match: SupabaseMatchData;
}

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  icon?: React.ElementType;
}

const StatBar = memo(function StatBar({ label, homeValue, awayValue, icon: Icon }: StatBarProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-foreground min-w-[32px]">{homeValue}</span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span className="text-xs uppercase tracking-wide">{label}</span>
        </div>
        <span className="font-semibold text-foreground min-w-[32px] text-right">{awayValue}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/30 gap-0.5">
        <div 
          className="bg-primary rounded-l-full transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-muted-foreground/40 rounded-r-full transition-all duration-500"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
});

// Stat configuration with icons and categories
interface StatConfig {
  label: string;
  icon: React.ElementType;
  category: 'possession' | 'attack' | 'defense' | 'discipline';
}

const statConfig: Record<string, StatConfig> = {
  // Possession & Passing
  'Possession': { label: 'Possession', icon: CircleDot, category: 'possession' },
  'Ball Possession': { label: 'Possession', icon: CircleDot, category: 'possession' },
  'Total passes': { label: 'Passes', icon: ArrowRightLeft, category: 'possession' },
  'Successful passes': { label: 'Completed passes', icon: ArrowRightLeft, category: 'possession' },
  'Passes accurate': { label: 'Completed passes', icon: ArrowRightLeft, category: 'possession' },
  'Passes %': { label: 'Pass accuracy', icon: ArrowRightLeft, category: 'possession' },
  'Key Passes': { label: 'Key passes', icon: ArrowRightLeft, category: 'possession' },
  
  // Attack
  'Expected Goals': { label: 'xG', icon: Target, category: 'attack' },
  'expected_goals': { label: 'xG', icon: Target, category: 'attack' },
  'Total Shots': { label: 'Shots', icon: Crosshair, category: 'attack' },
  'Shots on target': { label: 'On target', icon: Target, category: 'attack' },
  'Shots on Goal': { label: 'On target', icon: Target, category: 'attack' },
  'Shots off target': { label: 'Off target', icon: SquareX, category: 'attack' },
  'Blocked shots': { label: 'Blocked', icon: Shield, category: 'attack' },
  'Shots within penalty area': { label: 'Inside box', icon: Crosshair, category: 'attack' },
  'Shots outside penalty area': { label: 'Outside box', icon: Crosshair, category: 'attack' },
  'Shots insidebox': { label: 'Inside box', icon: Crosshair, category: 'attack' },
  'Shots outsidebox': { label: 'Outside box', icon: Crosshair, category: 'attack' },
  'Corners': { label: 'Corners', icon: Flag, category: 'attack' },
  'Corner Kicks': { label: 'Corners', icon: Flag, category: 'attack' },
  'Big Chances Created': { label: 'Big chances', icon: Target, category: 'attack' },
  'Dribbles': { label: 'Dribbles', icon: Footprints, category: 'attack' },
  'Successful Dribbles': { label: 'Dribbles won', icon: Footprints, category: 'attack' },
  'Crosses': { label: 'Crosses', icon: ArrowRightLeft, category: 'attack' },
  'Successful Crosses': { label: 'Crosses completed', icon: ArrowRightLeft, category: 'attack' },
  
  // Defense
  'Tackles': { label: 'Tackles', icon: Shield, category: 'defense' },
  'Successful Tackles': { label: 'Tackles won', icon: Shield, category: 'defense' },
  'Interceptions': { label: 'Interceptions', icon: Hand, category: 'defense' },
  'Clearances': { label: 'Clearances', icon: Shield, category: 'defense' },
  'Goalkeeper saves': { label: 'Saves', icon: Hand, category: 'defense' },
  'Goalkeeper Saves': { label: 'Saves', icon: Hand, category: 'defense' },
  'Aerial Duels': { label: 'Aerial duels', icon: Users, category: 'defense' },
  'Successful Aerial Duels': { label: 'Aerial won', icon: Users, category: 'defense' },
  
  // Discipline
  'Fouls': { label: 'Fouls', icon: AlertTriangle, category: 'discipline' },
  'Yellow cards': { label: 'Yellow cards', icon: Circle, category: 'discipline' },
  'Yellow Cards': { label: 'Yellow cards', icon: Circle, category: 'discipline' },
  'Red cards': { label: 'Red cards', icon: Circle, category: 'discipline' },
  'Red Cards': { label: 'Red cards', icon: Circle, category: 'discipline' },
  'Offsides': { label: 'Offsides', icon: Flag, category: 'discipline' },
  'Free Kicks': { label: 'Free kicks', icon: Target, category: 'discipline' },
};

const categoryLabels: Record<string, string> = {
  possession: 'Possession',
  attack: 'Attack',
  defense: 'Defense',
  discipline: 'Discipline'
};

const categoryOrder = ['possession', 'attack', 'defense', 'discipline'];

export const MatchStatsSection = memo(function MatchStatsSection({ match }: MatchStatsSectionProps) {
  const { data, isLoading, error } = useMatchData(match.id);

  const groupedStats = useMemo(() => {
    if (!data?.statistics || Array.isArray(data.statistics)) return null;
    
    const statistics = data.statistics as { home: Record<string, number | string>; away: Record<string, number | string> };
    if (!statistics.home && !statistics.away) return null;

    const homeStats = statistics.home || {};
    const awayStats = statistics.away || {};
    
    const groups: Record<string, Array<{ key: string; home: number; away: number; config: StatConfig }>> = {
      possession: [],
      attack: [],
      defense: [],
      discipline: []
    };

    // Process all stats
    const processedKeys = new Set<string>();
    
    Object.keys(homeStats).forEach(key => {
      if (processedKeys.has(key)) return;
      processedKeys.add(key);
      
      const config = statConfig[key];
      if (!config) return; // Skip unknown stats
      
      const homeValue = typeof homeStats[key] === 'string' 
        ? parseFloat(String(homeStats[key]).replace('%', '')) 
        : Number(homeStats[key]);
      const awayValue = typeof awayStats[key] === 'string' 
        ? parseFloat(String(awayStats[key]).replace('%', '')) 
        : Number(awayStats[key]);
      
      if (isNaN(homeValue) && isNaN(awayValue)) return;
      
      groups[config.category].push({
        key,
        home: homeValue || 0,
        away: awayValue || 0,
        config
      });
    });

    // Also check away stats for any keys not in home
    Object.keys(awayStats).forEach(key => {
      if (processedKeys.has(key)) return;
      processedKeys.add(key);
      
      const config = statConfig[key];
      if (!config) return;
      
      const awayValue = typeof awayStats[key] === 'string' 
        ? parseFloat(String(awayStats[key]).replace('%', '')) 
        : Number(awayStats[key]);
      
      if (isNaN(awayValue)) return;
      
      groups[config.category].push({
        key,
        home: 0,
        away: awayValue || 0,
        config
      });
    });

    return groups;
  }, [data?.statistics]);

  if (isLoading) {
    return <MatchDetailsSkeleton variant="stats" />;
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

  if (!groupedStats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Statistics</h3>
        <p className="text-sm">Statistics not available for this match</p>
      </div>
    );
  }

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

      {/* Stats by category */}
      <div className="space-y-6">
        {categoryOrder.map(category => {
          const stats = groupedStats[category];
          if (!stats || stats.length === 0) return null;
          
          return (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-4">
                {stats.map(stat => (
                  <StatBar
                    key={stat.key}
                    label={stat.config.label}
                    homeValue={stat.home}
                    awayValue={stat.away}
                    icon={stat.config.icon}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
