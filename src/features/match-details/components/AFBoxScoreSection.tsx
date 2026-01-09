import React, { useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { MatchDataResponse } from '../hooks/useMatchData';
import { MatchStatusBanner } from './MatchStatusBanner';
import { MatchScoreDisplay } from './MatchScoreDisplay';
import { usePlayersByName } from '../hooks/usePlayersByName';
import { Loader2 } from 'lucide-react';

interface AFBoxScoreSectionProps {
  match: SupabaseMatchData;
  matchData: MatchDataResponse | null | undefined;
  isLoading?: boolean;
}

interface AFPlayer {
  playerName: string;
  statistics: { name: string; value: string | number }[];
}

// Categorize players by their statistics
const categorizePlayer = (player: AFPlayer): string => {
  const statNames = player.statistics.map(s => s.name.toLowerCase());
  
  if (statNames.some(s => s.includes('passing yards') || s.includes('pass rating'))) {
    return 'Passing';
  }
  if (statNames.some(s => s.includes('rushing yards') || s.includes('rushing attempts'))) {
    return 'Rushing';
  }
  if (statNames.some(s => s.includes('receiving yards') || s.includes('receptions'))) {
    return 'Receiving';
  }
  if (statNames.some(s => s.includes('tackle') || s.includes('sack') || s.includes('interception'))) {
    return 'Defense';
  }
  if (statNames.some(s => s.includes('kick') || s.includes('punt'))) {
    return 'Special Teams';
  }
  return 'Other';
};

// Priority stats for each category
const CATEGORY_PRIORITY_STATS: Record<string, string[]> = {
  'Passing': ['Completed Passes', 'Passing Yards', 'Touchdowns', 'Interceptions', 'Pass Rating'],
  'Rushing': ['Rushing Attempts', 'Rushing Yards', 'Rushing Touchdowns', 'Yards Per Carry'],
  'Receiving': ['Receptions', 'Receiving Yards', 'Receiving Touchdowns', 'Targets'],
  'Defense': ['Total Tackles', 'Sacks', 'Interceptions', 'Forced Fumbles', 'Passes Defended'],
  'Special Teams': ['Field Goals Made', 'Field Goals Attempted', 'Kick Returns', 'Punt Returns'],
  'Other': [],
};

interface PlayerCardProps {
  player: AFPlayer;
  category: string;
  onPlayerClick: (name: string) => void;
  hasLink: boolean;
}

const PlayerCard = memo(function PlayerCard({ player, category, onPlayerClick, hasLink }: PlayerCardProps) {
  const priorityStats = CATEGORY_PRIORITY_STATS[category] || [];
  
  // Sort stats by priority
  const sortedStats = [...player.statistics].sort((a, b) => {
    const aIndex = priorityStats.findIndex(p => a.name.includes(p));
    const bIndex = priorityStats.findIndex(p => b.name.includes(p));
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div 
        className={`font-medium text-sm mb-2 ${hasLink ? 'text-primary cursor-pointer hover:underline' : ''}`}
        onClick={() => hasLink && onPlayerClick(player.playerName)}
      >
        {player.playerName}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {sortedStats.slice(0, 6).map((stat, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="text-muted-foreground truncate mr-2">{stat.name}</span>
            <span className="font-medium tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const AFBoxScoreSection = memo(function AFBoxScoreSection({ 
  match, 
  matchData,
  isLoading 
}: AFBoxScoreSectionProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');

  const boxScores = matchData?.boxScores;

  // Extract all player names for lookup
  const allPlayerNames = useMemo(() => {
    if (!boxScores) return [];
    const homeTeam = (boxScores as any)?.homeTeam || [];
    const awayTeam = (boxScores as any)?.awayTeam || [];
    return [...homeTeam, ...awayTeam].map((p: AFPlayer) => p.playerName);
  }, [boxScores]);

  const { data: playerMap } = usePlayersByName(allPlayerNames, 'american-football');

  const handlePlayerClick = (playerName: string) => {
    const playerId = playerMap?.get(playerName);
    if (playerId) {
      navigate(`/player/${playerId}`);
    }
  };

  // Group players by category
  const groupedPlayers = useMemo(() => {
    if (!boxScores) return { home: {}, away: {} };

    const homeTeam = (boxScores as any)?.homeTeam || [];
    const awayTeam = (boxScores as any)?.awayTeam || [];

    const groupByCategory = (players: AFPlayer[]) => {
      const groups: Record<string, AFPlayer[]> = {};
      players.forEach(player => {
        const category = categorizePlayer(player);
        if (!groups[category]) groups[category] = [];
        groups[category].push(player);
      });
      return groups;
    };

    return {
      home: groupByCategory(homeTeam),
      away: groupByCategory(awayTeam),
    };
  }, [boxScores]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boxScores || Object.keys(groupedPlayers.home).length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Box score not available
      </div>
    );
  }

  const currentPlayers = activeTeam === 'home' ? groupedPlayers.home : groupedPlayers.away;
  const categories = ['Passing', 'Rushing', 'Receiving', 'Defense', 'Special Teams', 'Other'].filter(
    cat => currentPlayers[cat]?.length > 0
  );

  const states = matchData?.states as { description?: string; report?: string } | undefined;

  return (
    <div>
      {/* Score Display */}
      <MatchScoreDisplay match={match} states={matchData?.states} />
      
      {/* Match Status */}
      <MatchStatusBanner description={states?.description} report={states?.report} />
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTeam('home')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            activeTeam === 'home' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {match.home_team?.logo && (
            <img src={match.home_team.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="text-sm font-medium truncate">
            {isMobile ? (match.home_team?.name?.split(' ').pop() || 'Home') : match.home_team?.name}
          </span>
        </button>
        <button
          onClick={() => setActiveTeam('away')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            activeTeam === 'away' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {match.away_team?.logo && (
            <img src={match.away_team.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="text-sm font-medium truncate">
            {isMobile ? (match.away_team?.name?.split(' ').pop() || 'Away') : match.away_team?.name}
          </span>
        </button>
      </div>

      {/* Categories */}
      {categories.map(category => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {category}
          </h3>
          <div className="divide-y divide-border">
            {currentPlayers[category]?.map((player, idx) => (
              <PlayerCard 
                key={idx} 
                player={player} 
                category={category} 
                onPlayerClick={handlePlayerClick}
                hasLink={!!playerMap?.has(player.playerName)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
