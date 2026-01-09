import React, { useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { MatchDataResponse } from '../hooks/useMatchData';
import { MatchStatusBanner } from './MatchStatusBanner';
import { MatchScoreDisplay } from './MatchScoreDisplay';
import { usePlayersByName } from '../hooks/usePlayersByName';
interface BasketballBoxScoreSectionProps {
  match: SupabaseMatchData;
  matchData: MatchDataResponse | null | undefined;
  isLoading: boolean;
}

interface PlayerStats {
  name: string;
  position?: string;
  stats: Record<string, string | number>;
}

interface TeamBoxScore {
  team?: {
    id?: number;
    name?: string;
    abbreviation?: string;
    logo?: string;
  };
  players: PlayerStats[];
}

interface BoxScoreData {
  home: TeamBoxScore | null;
  away: TeamBoxScore | null;
}

// Map display names to short column headers
const statColumns = [
  { key: 'Minutes Played', label: 'MIN', short: 'MIN' },
  { key: 'Points', label: 'PTS', short: 'PTS' },
  { key: 'Rebounds', label: 'REB', short: 'REB' },
  { key: 'Assists', label: 'AST', short: 'AST' },
  { key: 'Field Goals Made/Attempted', label: 'FG', short: 'FG' },
  { key: 'Three Point Field Goals Made/Attempted', label: '3PT', short: '3PT' },
  { key: 'Free Throws Made/Attempted', label: 'FT', short: 'FT' },
  { key: 'Steals', label: 'STL', short: 'STL' },
  { key: 'Blocks', label: 'BLK', short: 'BLK' },
  { key: 'Turnovers', label: 'TO', short: 'TO' },
  { key: 'Plus/Minus', label: '+/-', short: '+/-' },
];

// Helper to get stat value
function getStatValue(stats: Record<string, string | number>, key: string): string {
  const value = stats[key];
  if (value === undefined || value === null) return '-';
  return String(value);
}

// Helper to parse numeric value for sorting
function getNumericValue(stats: Record<string, string | number>, key: string): number {
  const value = stats[key];
  if (value === undefined || value === null) return 0;
  const num = parseFloat(String(value).split('/')[0].replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

export const BasketballBoxScoreSection = memo(function BasketballBoxScoreSection({ 
  match, 
  matchData, 
  isLoading 
}: BasketballBoxScoreSectionProps) {
  const navigate = useNavigate();
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [sortBy, setSortBy] = useState<string>('Points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // boxScores can be BoxScoreData object or array (from other sports)
  const rawBoxScores = matchData?.boxScores;
  const boxScores: BoxScoreData | null = rawBoxScores && !Array.isArray(rawBoxScores) 
    ? rawBoxScores as BoxScoreData 
    : null;

  // Extract all player names for lookup
  const allPlayerNames = useMemo(() => {
    const names: string[] = [];
    if (boxScores?.home?.players) {
      names.push(...boxScores.home.players.map(p => p.name));
    }
    if (boxScores?.away?.players) {
      names.push(...boxScores.away.players.map(p => p.name));
    }
    return names;
  }, [boxScores]);

  const { data: playerMap } = usePlayersByName(allPlayerNames, 'basketball');
  
  const currentPlayers = useMemo(() => {
    const teamData = activeTeam === 'home' ? boxScores?.home : boxScores?.away;
    const players = teamData?.players;
    if (!players || !Array.isArray(players)) return [];
    
    return [...players].sort((a, b) => {
      const aVal = getNumericValue(a.stats, sortBy);
      const bVal = getNumericValue(b.stats, sortBy);
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [boxScores, activeTeam, sortBy, sortDirection]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const handlePlayerClick = (playerName: string) => {
    const playerId = playerMap?.get(playerName);
    if (playerId) {
      navigate(`/player/${playerId}`);
    }
  };

  const homeName = match.home_team?.name || match.home || 'Home';
  const awayName = match.away_team?.name || match.away || 'Away';
  const homeLogo = match.home_team?.logo;
  const awayLogo = match.away_team?.logo;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boxScores?.home?.players?.length && !boxScores?.away?.players?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Box Score</h3>
        <p className="text-sm">Player statistics not available for this match</p>
      </div>
    );
  }

  const states = matchData?.states as { description?: string; report?: string } | undefined;

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <MatchScoreDisplay match={match} states={matchData?.states} />
      
      {/* Match Status */}
      <MatchStatusBanner description={states?.description} report={states?.report} />

      {/* Team Toggle */}
      <div className="flex bg-muted/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTeam('home')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
            activeTeam === 'home'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          {homeLogo && (
            <img src={homeLogo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="truncate">{homeName}</span>
        </button>
        <button
          onClick={() => setActiveTeam('away')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
            activeTeam === 'away'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          {awayLogo && (
            <img src={awayLogo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="truncate">{awayName}</span>
        </button>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase">
              <th className="text-left py-2 px-2 font-medium sticky left-0 bg-background z-10">
                Player
              </th>
              {statColumns.map(col => (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "text-center py-2 px-2 font-medium cursor-pointer hover:bg-muted/50 transition-colors whitespace-nowrap",
                    sortBy === col.key && 'text-primary'
                  )}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    {col.short}
                    {sortBy === col.key && (
                      sortDirection === 'desc' 
                        ? <ChevronDown className="h-3 w-3" />
                        : <ChevronUp className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPlayers.map((player, idx) => {
              const hasPlayerLink = playerMap?.has(player.name);
              return (
              <tr 
                key={`${player.name}-${idx}`}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2.5 px-2 sticky left-0 bg-background z-10">
                  <div 
                    className={cn("flex flex-col", hasPlayerLink && "cursor-pointer")}
                    onClick={() => handlePlayerClick(player.name)}
                  >
                    <span className={cn(
                      "font-medium truncate max-w-[140px]",
                      hasPlayerLink ? "text-primary hover:underline" : "text-foreground"
                    )}>
                      {player.name}
                    </span>
                    {player.position && (
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {player.position}
                      </span>
                    )}
                  </div>
                </td>
                {statColumns.map(col => {
                  const value = getStatValue(player.stats, col.key);
                  const isPlusMinus = col.key === 'Plus/Minus';
                  const numVal = parseFloat(value);
                  
                  return (
                    <td 
                      key={col.key}
                      className={cn(
                        "text-center py-2.5 px-2 font-mono text-xs",
                        isPlusMinus && !isNaN(numVal) && numVal > 0 && 'text-green-500',
                        isPlusMinus && !isNaN(numVal) && numVal < 0 && 'text-red-500',
                        sortBy === col.key && 'font-semibold text-foreground'
                      )}
                    >
                      {isPlusMinus && !isNaN(numVal) && numVal > 0 ? `+${value}` : value}
                    </td>
                  );
                })}
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {currentPlayers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No player data available</p>
        </div>
      )}
    </div>
  );
});
