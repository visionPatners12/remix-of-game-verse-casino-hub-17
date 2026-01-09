import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';
import { Users } from 'lucide-react';
import { usePlayersByName } from '../hooks/usePlayersByName';

interface BaseballPlayer {
  id?: number;
  name: string;
  number: number;
  position: string;
  positionAbbreviation?: string;
}

interface BaseballTeamLineup {
  teamId: string;
  name: string;
  logo: string;
  initialLineup: BaseballPlayer[][] | BaseballPlayer[];
  substitutes: BaseballPlayer[];
}

interface BaseballLineupsSectionProps {
  lineupData: {
    homeTeam: BaseballTeamLineup | null;
    awayTeam: BaseballTeamLineup | null;
  } | null;
  isLoading?: boolean;
}

const getPositionColor = (position: string): string => {
  const pos = position.toLowerCase();
  if (pos.includes('pitcher') || pos === 'p') return 'bg-red-500/20 text-red-400';
  if (pos.includes('catcher') || pos === 'c') return 'bg-purple-500/20 text-purple-400';
  if (pos.includes('first') || pos.includes('second') || pos.includes('short') || pos.includes('third') || 
      ['1b', '2b', '3b', 'ss'].includes(pos)) {
    return 'bg-blue-500/20 text-blue-400';
  }
  if (pos.includes('field') || ['lf', 'cf', 'rf'].includes(pos)) {
    return 'bg-green-500/20 text-green-400';
  }
  if (pos.includes('designated') || pos === 'dh') return 'bg-amber-500/20 text-amber-400';
  return 'bg-muted text-muted-foreground';
};

interface PlayerCardProps {
  player: BaseballPlayer;
  onPlayerClick: (name: string) => void;
  hasLink: boolean;
}

const PlayerCard = ({ player, onPlayerClick, hasLink }: PlayerCardProps) => {
  const positionDisplay = player.positionAbbreviation || player.position?.slice(0, 2).toUpperCase() || '?';
  
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
          {player.number}
        </div>
        <span 
          className={`font-medium ${hasLink ? 'text-primary cursor-pointer hover:underline' : 'text-foreground'}`}
          onClick={() => hasLink && onPlayerClick(player.name)}
        >
          {player.name}
        </span>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPositionColor(player.position || positionDisplay)}`}>
        {positionDisplay}
      </span>
    </div>
  );
};

interface TeamLineupProps {
  lineup: BaseballTeamLineup;
  onPlayerClick: (name: string) => void;
  playerMap: Map<string, string> | undefined;
}

const TeamLineup = ({ lineup, onPlayerClick, playerMap }: TeamLineupProps) => {
  const starters = Array.isArray(lineup.initialLineup?.[0]) 
    ? (lineup.initialLineup as BaseballPlayer[][]).flat()
    : (lineup.initialLineup as BaseballPlayer[]) || [];
  
  const substitutes = lineup.substitutes || [];

  return (
    <div className="divide-y divide-border">
      <div>
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
          <span className="text-lg">⚾</span>
          <span className="font-semibold text-foreground">Starting Lineup</span>
          <span className="text-muted-foreground text-sm">({starters.length})</span>
        </div>
        <div>
          {starters.length > 0 ? (
            starters.map((player, idx) => (
              <PlayerCard 
                key={player.id || idx} 
                player={player}
                onPlayerClick={onPlayerClick}
                hasLink={!!playerMap?.has(player.name)}
              />
            ))
          ) : (
            <div className="py-6 text-center text-muted-foreground">No lineup data available</div>
          )}
        </div>
      </div>

      {substitutes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
            <span className="text-lg">🔄</span>
            <span className="font-semibold text-foreground">Bench</span>
            <span className="text-muted-foreground text-sm">({substitutes.length})</span>
          </div>
          <div>
            {substitutes.map((player, idx) => (
              <PlayerCard 
                key={player.id || idx} 
                player={player}
                onPlayerClick={onPlayerClick}
                hasLink={!!playerMap?.has(player.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function BaseballLineupsSection({ lineupData, isLoading }: BaseballLineupsSectionProps) {
  const navigate = useNavigate();

  const allPlayerNames = useMemo(() => {
    const names: string[] = [];
    if (lineupData?.homeTeam) {
      const starters = Array.isArray(lineupData.homeTeam.initialLineup?.[0])
        ? (lineupData.homeTeam.initialLineup as BaseballPlayer[][]).flat()
        : (lineupData.homeTeam.initialLineup as BaseballPlayer[]) || [];
      names.push(...starters.map(p => p.name));
      names.push(...(lineupData.homeTeam.substitutes || []).map(p => p.name));
    }
    if (lineupData?.awayTeam) {
      const starters = Array.isArray(lineupData.awayTeam.initialLineup?.[0])
        ? (lineupData.awayTeam.initialLineup as BaseballPlayer[][]).flat()
        : (lineupData.awayTeam.initialLineup as BaseballPlayer[]) || [];
      names.push(...starters.map(p => p.name));
      names.push(...(lineupData.awayTeam.substitutes || []).map(p => p.name));
    }
    return names;
  }, [lineupData]);

  const { data: playerMap } = usePlayersByName(allPlayerNames, 'baseball');

  const handlePlayerClick = (playerName: string) => {
    const playerId = playerMap?.get(playerName);
    if (playerId) {
      navigate(`/player/${playerId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!lineupData || (!lineupData.homeTeam && !lineupData.awayTeam)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <Users className="h-8 w-8 opacity-50" />
        <p>No lineup data available</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="w-full h-12 bg-muted/30 p-1 rounded-lg mb-4">
        {lineupData.homeTeam && (
          <TabsTrigger 
            value="home" 
            className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            {lineupData.homeTeam.logo && (
              <img src={lineupData.homeTeam.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="truncate">{lineupData.homeTeam.name}</span>
          </TabsTrigger>
        )}
        {lineupData.awayTeam && (
          <TabsTrigger 
            value="away" 
            className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            {lineupData.awayTeam.logo && (
              <img src={lineupData.awayTeam.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="truncate">{lineupData.awayTeam.name}</span>
          </TabsTrigger>
        )}
      </TabsList>

      {lineupData.homeTeam && (
        <TabsContent value="home" className="mt-0">
          <TeamLineup 
            lineup={lineupData.homeTeam}
            onPlayerClick={handlePlayerClick}
            playerMap={playerMap}
          />
        </TabsContent>
      )}

      {lineupData.awayTeam && (
        <TabsContent value="away" className="mt-0">
          <TeamLineup 
            lineup={lineupData.awayTeam}
            onPlayerClick={handlePlayerClick}
            playerMap={playerMap}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
