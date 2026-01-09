import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';
import { Users, Swords, Shield, Footprints, ClipboardList } from 'lucide-react';
import { usePlayersByName } from '../hooks/usePlayersByName';

interface AFPlayer {
  id?: number;
  name: string;
  number: number;
  position: string;
  positionAbbreviation?: string;
}

interface AFTeamLineup {
  teamId: string;
  name: string;
  logo: string;
  initialLineup: AFPlayer[][] | AFPlayer[];
  substitutes: AFPlayer[];
}

interface AFLineupsSectionProps {
  lineupData: {
    homeTeam: AFTeamLineup | null;
    awayTeam: AFTeamLineup | null;
  } | null;
  isLoading?: boolean;
}

const POSITION_GROUPS: Record<string, string[]> = {
  'OFFENSE': ['QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'C', 'OL', 'T', 'G'],
  'DEFENSE': ['DE', 'DT', 'NT', 'DL', 'LB', 'OLB', 'ILB', 'MLB', 'CB', 'S', 'FS', 'SS', 'DB'],
  'SPECIAL TEAMS': ['K', 'P', 'LS', 'KR', 'PR'],
};

const getPositionGroup = (posAbbr: string): string => {
  const abbr = posAbbr?.toUpperCase() || '';
  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    if (positions.includes(abbr)) return group;
  }
  return 'OTHER';
};

const getPositionColor = (position: string): string => {
  const pos = position?.toUpperCase() || '';
  if (pos === 'QB') return 'bg-red-500/20 text-red-400';
  if (['RB', 'FB'].includes(pos)) return 'bg-purple-500/20 text-purple-400';
  if (['WR', 'TE'].includes(pos)) return 'bg-blue-500/20 text-blue-400';
  if (['OT', 'OG', 'C', 'OL', 'T', 'G'].includes(pos)) return 'bg-amber-500/20 text-amber-400';
  if (['DE', 'DT', 'NT', 'DL'].includes(pos)) return 'bg-green-500/20 text-green-400';
  if (['LB', 'OLB', 'ILB', 'MLB'].includes(pos)) return 'bg-teal-500/20 text-teal-400';
  if (['CB', 'S', 'FS', 'SS', 'DB'].includes(pos)) return 'bg-cyan-500/20 text-cyan-400';
  if (['K', 'P', 'LS', 'KR', 'PR'].includes(pos)) return 'bg-pink-500/20 text-pink-400';
  return 'bg-muted text-muted-foreground';
};

interface PlayerCardProps {
  player: AFPlayer;
  isStarter?: boolean;
  onPlayerClick: (name: string) => void;
  hasLink: boolean;
}

const PlayerCard = ({ player, isStarter, onPlayerClick, hasLink }: PlayerCardProps) => {
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
        {isStarter && (
          <span className="text-xs text-primary">★</span>
        )}
      </div>
      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPositionColor(positionDisplay)}`}>
        {positionDisplay}
      </span>
    </div>
  );
};

interface TeamLineupProps {
  lineup: AFTeamLineup;
  onPlayerClick: (name: string) => void;
  playerMap: Map<string, string> | undefined;
}

const TeamLineup = ({ lineup, onPlayerClick, playerMap }: TeamLineupProps) => {
  const starters = Array.isArray(lineup.initialLineup?.[0]) 
    ? (lineup.initialLineup as AFPlayer[][]).flat()
    : (lineup.initialLineup as AFPlayer[]) || [];
  
  const substitutes = lineup.substitutes || [];

  const groupedStarters: Record<string, AFPlayer[]> = {};
  starters.forEach(player => {
    const group = getPositionGroup(player.positionAbbreviation || player.position || '');
    if (!groupedStarters[group]) groupedStarters[group] = [];
    groupedStarters[group].push(player);
  });

  const groupOrder = ['OFFENSE', 'DEFENSE', 'SPECIAL TEAMS', 'OTHER'];

  return (
    <div className="divide-y divide-border">
      {groupOrder.map(group => {
        const players = groupedStarters[group];
        if (!players || players.length === 0) return null;
        
        return (
          <div key={group}>
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
              {group === 'OFFENSE' ? (
                <Swords className="h-4 w-4 text-muted-foreground" />
              ) : group === 'DEFENSE' ? (
                <Shield className="h-4 w-4 text-muted-foreground" />
              ) : group === 'SPECIAL TEAMS' ? (
                <Footprints className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">{group}</span>
              <span className="text-muted-foreground text-sm">({players.length})</span>
            </div>
            <div>
              {players.map((player, idx) => (
                <PlayerCard 
                  key={player.id || idx} 
                  player={player} 
                  isStarter 
                  onPlayerClick={onPlayerClick}
                  hasLink={!!playerMap?.has(player.name)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {substitutes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
            <span className="text-lg">🔄</span>
            <span className="font-semibold text-foreground">Reserves</span>
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

      {starters.length === 0 && substitutes.length === 0 && (
        <div className="py-6 text-center text-muted-foreground">No lineup data available</div>
      )}
    </div>
  );
};

export function AFLineupsSection({ lineupData, isLoading }: AFLineupsSectionProps) {
  const navigate = useNavigate();

  const allPlayerNames = useMemo(() => {
    const names: string[] = [];
    if (lineupData?.homeTeam) {
      const starters = Array.isArray(lineupData.homeTeam.initialLineup?.[0])
        ? (lineupData.homeTeam.initialLineup as AFPlayer[][]).flat()
        : (lineupData.homeTeam.initialLineup as AFPlayer[]) || [];
      names.push(...starters.map(p => p.name));
      names.push(...(lineupData.homeTeam.substitutes || []).map(p => p.name));
    }
    if (lineupData?.awayTeam) {
      const starters = Array.isArray(lineupData.awayTeam.initialLineup?.[0])
        ? (lineupData.awayTeam.initialLineup as AFPlayer[][]).flat()
        : (lineupData.awayTeam.initialLineup as AFPlayer[]) || [];
      names.push(...starters.map(p => p.name));
      names.push(...(lineupData.awayTeam.substitutes || []).map(p => p.name));
    }
    return names;
  }, [lineupData]);

  const { data: playerMap } = usePlayersByName(allPlayerNames, 'american-football');

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
        <p>No roster data available</p>
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
