import React, { memo, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';
import { Loader2, BarChart3, Circle, Target, Shirt } from 'lucide-react';
import { useMatchData } from '../hooks/useMatchData';
import { MatchScoreDisplay } from './MatchScoreDisplay';
import { MatchStatusBanner } from './MatchStatusBanner';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface BaseballStatsSectionProps {
  match: SupabaseMatchData;
}

interface StatItem {
  displayName: string;
  value: number | string;
}

interface TeamStats {
  batting?: StatItem[];
  fielding?: StatItem[];
  pitching?: StatItem[];
}

export const BaseballStatsSection = memo(function BaseballStatsSection({ match }: BaseballStatsSectionProps) {
  const { data: matchData, isLoading } = useMatchData(match.id);

  const stats = useMemo(() => {
    if (!matchData?.statistics) return null;
    
    const rawStats = matchData.statistics as any;
    
    // Handle both array format and direct object format
    const homeStats: TeamStats = Array.isArray(rawStats?.homeTeam) 
      ? rawStats.homeTeam[0] 
      : rawStats?.homeTeam;
    const awayStats: TeamStats = Array.isArray(rawStats?.awayTeam) 
      ? rawStats.awayTeam[0] 
      : rawStats?.awayTeam;

    return { homeStats, awayStats };
  }, [matchData?.statistics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats || (!stats.homeStats && !stats.awayStats)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Statistics not available</h3>
        <p className="text-sm">Stats will appear once the game starts</p>
      </div>
    );
  }

  const renderStatRow = (statName: string, homeValue: number | string | undefined, awayValue: number | string | undefined) => (
    <div key={statName} className="flex items-center py-2 border-b border-border last:border-b-0">
      <div className="flex-1 text-right pr-4">
        <span className="font-semibold">{homeValue ?? '-'}</span>
      </div>
      <div className="w-32 text-center text-xs text-muted-foreground">
        {statName}
      </div>
      <div className="flex-1 text-left pl-4">
        <span className="font-semibold">{awayValue ?? '-'}</span>
      </div>
    </div>
  );

  const renderStatsCategory = (category: 'batting' | 'fielding' | 'pitching') => {
    const homeItems = stats.homeStats?.[category]?.filter(Boolean) || [];
    const awayItems = stats.awayStats?.[category]?.filter(Boolean) || [];
    
    // Get all unique stat names
    const statNames = [...new Set([
      ...homeItems.map(s => s?.displayName),
      ...awayItems.map(s => s?.displayName)
    ])].filter(Boolean);

    if (statNames.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No {category} statistics available</p>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {/* Team headers */}
        <div className="flex items-center py-3 border-b border-border bg-muted/30">
          <div className="flex-1 text-right pr-4 flex items-center justify-end gap-2">
            {match.home_team?.logo && (
              <img 
                src={match.home_team.logo} 
                alt={match.home_team.name || ''} 
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-semibold text-sm">{match.home_team?.name || 'Home'}</span>
          </div>
          <div className="w-32" />
          <div className="flex-1 text-left pl-4 flex items-center gap-2">
            {match.away_team?.logo && (
              <img 
                src={match.away_team.logo} 
                alt={match.away_team.name || ''} 
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-semibold text-sm">{match.away_team?.name || 'Away'}</span>
          </div>
        </div>

        {/* Stats rows */}
        {statNames.map(statName => {
          const homeStat = homeItems.find(s => s?.displayName === statName);
          const awayStat = awayItems.find(s => s?.displayName === statName);
          return renderStatRow(statName!, homeStat?.value, awayStat?.value);
        })}
      </div>
    );
  };

  const states = matchData?.states as { description?: string; report?: string } | undefined;

  return (
    <div>
      {/* Score Display */}
      <MatchScoreDisplay match={match} states={matchData?.states} />
      
      {/* Match Status */}
      <MatchStatusBanner description={states?.description} report={states?.report} />
      
      <Tabs defaultValue="batting" className="w-full">
        <TabsList className="w-full h-10 bg-muted/30 p-1 rounded-lg mb-4">
          <TabsTrigger value="batting" className="flex-1 text-xs gap-1">
            <Circle className="h-3 w-3" />
            Batting
          </TabsTrigger>
          <TabsTrigger value="pitching" className="flex-1 text-xs gap-1">
            <Target className="h-3 w-3" />
            Pitching
          </TabsTrigger>
          <TabsTrigger value="fielding" className="flex-1 text-xs gap-1">
            <Shirt className="h-3 w-3" />
            Fielding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batting" className="mt-0">
          {renderStatsCategory('batting')}
        </TabsContent>

        <TabsContent value="pitching" className="mt-0">
          {renderStatsCategory('pitching')}
        </TabsContent>

        <TabsContent value="fielding" className="mt-0">
          {renderStatsCategory('fielding')}
        </TabsContent>
      </Tabs>
    </div>
  );
});
