import React, { memo, useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { MatchDataResponse } from '../hooks/useMatchData';

interface TopPerformer {
  name: string;
  playerName: string;
  playerPosition: string;
  value: number | string;
}

interface TopPerformers {
  homeTeam: TopPerformer[];
  awayTeam: TopPerformer[];
}

interface TopPerformersSectionProps {
  match: SupabaseMatchData;
  matchData: MatchDataResponse | null | undefined;
  isLoading?: boolean;
}

// Group performers by category
const STAT_CATEGORIES = {
  'Passing': ['Passing Yards', 'Passing Touchdowns', 'Interceptions Thrown'],
  'Rushing': ['Rushing Attempts', 'Rushing Yards', 'Rushing Touchdowns'],
  'Receiving': ['Receptions', 'Receiving Yards', 'Receiving Touchdowns'],
};

const getCategoryForStat = (statName: string): string => {
  for (const [category, stats] of Object.entries(STAT_CATEGORIES)) {
    if (stats.includes(statName)) return category;
  }
  return 'Other';
};

const formatStatName = (name: string): string => {
  return name
    .replace('Passing ', '')
    .replace('Rushing ', '')
    .replace('Receiving ', '')
    .replace('Interceptions Thrown', 'INT');
};

const PerformerCard = memo(function PerformerCard({ 
  performer, 
  teamName,
  teamLogo 
}: { 
  performer: TopPerformer; 
  teamName?: string;
  teamLogo?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        {teamLogo && (
          <img src={teamLogo} alt="" className="w-6 h-6 object-contain" />
        )}
        <div>
          <div className="text-sm font-medium">{performer.playerName}</div>
          <div className="text-xs text-muted-foreground">{performer.playerPosition}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">{performer.value}</div>
        <div className="text-xs text-muted-foreground">{formatStatName(performer.name)}</div>
      </div>
    </div>
  );
});

const CategorySection = memo(function CategorySection({
  category,
  homePerformers,
  awayPerformers,
  match,
  activeTeam
}: {
  category: string;
  homePerformers: TopPerformer[];
  awayPerformers: TopPerformer[];
  match: SupabaseMatchData;
  activeTeam: 'home' | 'away';
}) {
  const performers = activeTeam === 'home' ? homePerformers : awayPerformers;
  const team = activeTeam === 'home' ? match.home_team : match.away_team;

  if (performers.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {category}
      </h4>
      <div className="divide-y divide-border">
        {performers.map((performer, idx) => (
          <PerformerCard
            key={`${performer.name}-${idx}`}
            performer={performer}
            teamName={team?.name}
            teamLogo={team?.logo}
          />
        ))}
      </div>
    </div>
  );
});

export const TopPerformersSection = memo(function TopPerformersSection({ 
  match, 
  matchData, 
  isLoading 
}: TopPerformersSectionProps) {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');

  const topPerformers = matchData?.topPerformers as TopPerformers | undefined;

  // Group performers by category
  const groupedPerformers = useMemo(() => {
    if (!topPerformers) return { home: {}, away: {} };

    const groupByCategory = (performers: TopPerformer[]) => {
      const grouped: Record<string, TopPerformer[]> = {};
      performers.forEach(p => {
        const cat = getCategoryForStat(p.name);
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
      });
      return grouped;
    };

    return {
      home: groupByCategory(topPerformers.homeTeam || []),
      away: groupByCategory(topPerformers.awayTeam || [])
    };
  }, [topPerformers]);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading top performers...
      </div>
    );
  }

  if (!topPerformers || (!topPerformers.homeTeam?.length && !topPerformers.awayTeam?.length)) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Top performers not available
      </div>
    );
  }

  const categories = Object.keys(STAT_CATEGORIES);
  const activeGrouped = activeTeam === 'home' ? groupedPerformers.home : groupedPerformers.away;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Top Performers</h3>
      </div>

      {/* Team Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTeam('home')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTeam === 'home'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {match.home_team?.logo && (
            <img src={match.home_team.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="truncate">{match.home_team?.name || 'Home'}</span>
        </button>
        <button
          onClick={() => setActiveTeam('away')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTeam === 'away'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {match.away_team?.logo && (
            <img src={match.away_team.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="truncate">{match.away_team?.name || 'Away'}</span>
        </button>
      </div>

      {/* Stats by Category */}
      <div>
        {categories.map(category => {
          const homePerformers = groupedPerformers.home[category] || [];
          const awayPerformers = groupedPerformers.away[category] || [];
          
          return (
            <CategorySection
              key={category}
              category={category}
              homePerformers={homePerformers}
              awayPerformers={awayPerformers}
              match={match}
              activeTeam={activeTeam}
            />
          );
        })}
      </div>
    </div>
  );
});
