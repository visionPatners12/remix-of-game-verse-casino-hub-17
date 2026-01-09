import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui';
import { Users, Shield } from 'lucide-react';
import { useMatchBoxScore } from '../hooks/useMatchBoxScore';
import { useMatchData } from '../hooks/useMatchData';
import { usePlayersByName } from '../hooks/usePlayersByName';
import { MatchStatusBanner } from './MatchStatusBanner';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface HockeyBoxScoreSectionProps {
  match: SupabaseMatchData;
}

interface HockeyPlayerStats {
  id: number;
  name: string;
  fullName: string;
  shirtNumber: number;
  position: string;
  statistics: {
    goals?: number;
    assists?: number;
    points?: number;
    plusMinus?: number;
    pim?: number; // Penalty minutes
    sog?: number; // Shots on goal
    toi?: string; // Time on ice
    faceoffPct?: number;
    hits?: number;
    blocks?: number;
    takeaways?: number;
    giveaways?: number;
    // Goalie stats
    saves?: number;
    goalsAgainst?: number;
    savePercentage?: number;
  };
}

// Position colors for hockey
const getPositionColor = (position: string): string => {
  const pos = position.toLowerCase();
  if (pos.includes('center') || pos === 'c') return 'bg-blue-500/20 text-blue-400';
  if (pos.includes('left') || pos === 'lw') return 'bg-cyan-500/20 text-cyan-400';
  if (pos.includes('right') || pos === 'rw') return 'bg-green-500/20 text-green-400';
  if (pos.includes('defense') || pos === 'd' || pos === 'ld' || pos === 'rd') return 'bg-amber-500/20 text-amber-400';
  if (pos.includes('goal') || pos === 'g') return 'bg-red-500/20 text-red-400';
  return 'bg-muted text-muted-foreground';
};

interface PlayerStatRowProps {
  player: HockeyPlayerStats;
  onPlayerClick: (name: string) => void;
  hasLink: boolean;
}

const PlayerStatRow = ({ player, onPlayerClick, hasLink }: PlayerStatRowProps) => {
  const stats = player.statistics || {};
  const isGoalie = player.position?.toLowerCase().includes('goal') || player.position === 'G';
  const playerName = player.name || player.fullName;
  
  return (
    <div className="flex items-center py-3 px-4 border-b border-border last:border-b-0 hover:bg-muted/20">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {player.shirtNumber || '-'}
        </div>
        <div className="min-w-0">
          <span 
            className={`font-medium text-sm truncate block ${hasLink ? 'text-primary cursor-pointer hover:underline' : 'text-foreground'}`}
            onClick={() => hasLink && onPlayerClick(playerName)}
          >
            {playerName}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPositionColor(player.position)}`}>
            {player.position?.slice(0, 2).toUpperCase() || '?'}
          </span>
        </div>
      </div>
      
      {/* Stats columns */}
      <div className="flex items-center gap-2 text-xs">
        {isGoalie ? (
          // Goalie stats
          <>
            <div className="w-10 text-center">
              <div className="text-muted-foreground">SV</div>
              <div className="font-semibold text-foreground">{stats.saves ?? '-'}</div>
            </div>
            <div className="w-10 text-center">
              <div className="text-muted-foreground">GA</div>
              <div className="font-semibold text-foreground">{stats.goalsAgainst ?? '-'}</div>
            </div>
            <div className="w-12 text-center">
              <div className="text-muted-foreground">SV%</div>
              <div className="font-semibold text-foreground">
                {stats.savePercentage ? `${(stats.savePercentage * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </>
        ) : (
          // Skater stats
          <>
            <div className="w-8 text-center">
              <div className="text-muted-foreground">G</div>
              <div className="font-semibold text-foreground">{stats.goals ?? '-'}</div>
            </div>
            <div className="w-8 text-center">
              <div className="text-muted-foreground">A</div>
              <div className="font-semibold text-foreground">{stats.assists ?? '-'}</div>
            </div>
            <div className="w-8 text-center">
              <div className="text-muted-foreground">PTS</div>
              <div className="font-semibold text-primary">{stats.points ?? ((stats.goals || 0) + (stats.assists || 0))}</div>
            </div>
            <div className="w-8 text-center">
              <div className="text-muted-foreground">+/-</div>
              <div className={`font-semibold ${(stats.plusMinus || 0) > 0 ? 'text-green-400' : (stats.plusMinus || 0) < 0 ? 'text-red-400' : 'text-foreground'}`}>
                {stats.plusMinus !== undefined ? (stats.plusMinus > 0 ? `+${stats.plusMinus}` : stats.plusMinus) : '-'}
              </div>
            </div>
            <div className="w-8 text-center hidden sm:block">
              <div className="text-muted-foreground">SOG</div>
              <div className="font-semibold text-foreground">{stats.sog ?? '-'}</div>
            </div>
            <div className="w-10 text-center hidden md:block">
              <div className="text-muted-foreground">TOI</div>
              <div className="font-semibold text-foreground">{stats.toi ?? '-'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface TeamBoxScoreProps {
  players: HockeyPlayerStats[];
  onPlayerClick: (name: string) => void;
  playerMap: Map<string, string> | undefined;
}

const TeamBoxScore = ({ players, onPlayerClick, playerMap }: TeamBoxScoreProps) => {
  // Separate skaters and goalies
  const goalies = players.filter(p => p.position?.toLowerCase().includes('goal') || p.position === 'G');
  const skaters = players.filter(p => !p.position?.toLowerCase().includes('goal') && p.position !== 'G');
  
  // Sort skaters by points (goals + assists)
  const sortedSkaters = [...skaters].sort((a, b) => {
    const aPoints = (a.statistics?.goals || 0) + (a.statistics?.assists || 0);
    const bPoints = (b.statistics?.goals || 0) + (b.statistics?.assists || 0);
    return bPoints - aPoints;
  });

  return (
    <div className="divide-y divide-border">
      {/* Skaters */}
      <div>
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Skaters</span>
          <span className="text-muted-foreground text-sm">({sortedSkaters.length})</span>
        </div>
        <div>
          {sortedSkaters.length > 0 ? (
            sortedSkaters.map((player, idx) => {
              const playerName = player.name || player.fullName;
              return (
                <PlayerStatRow 
                  key={player.id || idx} 
                  player={player} 
                  onPlayerClick={onPlayerClick}
                  hasLink={!!playerMap?.has(playerName)}
                />
              );
            })
          ) : (
            <div className="py-6 text-center text-muted-foreground">No player data available</div>
          )}
        </div>
      </div>

      {/* Goalies */}
      {goalies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Goalies</span>
            <span className="text-muted-foreground text-sm">({goalies.length})</span>
          </div>
          <div>
            {goalies.map((player, idx) => {
              const playerName = player.name || player.fullName;
              return (
                <PlayerStatRow 
                  key={player.id || idx} 
                  player={player} 
                  onPlayerClick={onPlayerClick}
                  hasLink={!!playerMap?.has(playerName)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export function HockeyBoxScoreSection({ match }: HockeyBoxScoreSectionProps) {
  const navigate = useNavigate();
  const { data: boxScoreData, isLoading, error } = useMatchBoxScore(match.azuro_game_id);
  const { data: matchData } = useMatchData(match.id);
  const states = matchData?.states as { description?: string; report?: string } | undefined;

  // Extract all player names for lookup
  const allPlayerNames = useMemo(() => {
    const names: string[] = [];
    if (boxScoreData?.homeTeam?.players) {
      names.push(...boxScoreData.homeTeam.players.map((p: HockeyPlayerStats) => p.name || p.fullName));
    }
    if (boxScoreData?.awayTeam?.players) {
      names.push(...boxScoreData.awayTeam.players.map((p: HockeyPlayerStats) => p.name || p.fullName));
    }
    return names;
  }, [boxScoreData]);

  const { data: playerMap } = usePlayersByName(allPlayerNames, 'hockey');

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

  if (error || !boxScoreData || (!boxScoreData.homeTeam && !boxScoreData.awayTeam)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <Users className="h-8 w-8 opacity-50" />
        <p>No box score data available</p>
      </div>
    );
  }

  const homeTeam = boxScoreData.homeTeam;
  const awayTeam = boxScoreData.awayTeam;

  return (
    <div className="space-y-4">
      {/* Match Status */}
      <MatchStatusBanner description={states?.description} report={states?.report} />

      <Tabs defaultValue="home" className="w-full">
      <TabsList className="w-full h-12 bg-muted/30 p-1 rounded-lg mb-4">
        {homeTeam && (
          <TabsTrigger 
            value="home" 
            className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            {homeTeam.team?.logo && (
              <img src={homeTeam.team.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="truncate">{homeTeam.team?.name || 'Home'}</span>
          </TabsTrigger>
        )}
        {awayTeam && (
          <TabsTrigger 
            value="away" 
            className="flex-1 h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            {awayTeam.team?.logo && (
              <img src={awayTeam.team.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="truncate">{awayTeam.team?.name || 'Away'}</span>
          </TabsTrigger>
        )}
      </TabsList>

      {homeTeam && (
        <TabsContent value="home" className="mt-0">
          <TeamBoxScore 
            players={homeTeam.players as HockeyPlayerStats[]} 
            onPlayerClick={handlePlayerClick}
            playerMap={playerMap}
          />
        </TabsContent>
      )}

      {awayTeam && (
        <TabsContent value="away" className="mt-0">
          <TeamBoxScore 
            players={awayTeam.players as HockeyPlayerStats[]} 
            onPlayerClick={handlePlayerClick}
            playerMap={playerMap}
          />
        </TabsContent>
      )}
      </Tabs>
    </div>
  );
}
