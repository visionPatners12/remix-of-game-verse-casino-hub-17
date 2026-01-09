import React, { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import { useMatchLineup, type LineupPlayer, type TeamLineup } from '../hooks/useMatchLineup';
import { LoadingSpinner } from '@/ui';

interface MatchLineupSectionProps {
  match: SupabaseMatchData;
}

interface VerticalFootballFieldProps {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
  onPlayerClick: (playerId: string | undefined) => void;
}

interface SubstitutesSectionProps {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
  onPlayerClick: (playerId: string | undefined) => void;
  t: (key: string) => string;
}

// Calculate player positions for vertical field
const calculateVerticalPositions = (
  lineup: LineupPlayer[][],
  isHomeTeam: boolean
): { player: LineupPlayer; x: number; y: number }[] => {
  const positions: { player: LineupPlayer; x: number; y: number }[] = [];
  const rowCount = lineup.length;

  lineup.forEach((row, rowIndex) => {
    const playersInRow = row.length;

    row.forEach((player, playerIndex) => {
      // X position: distribute players horizontally (15% to 85%)
      const x = playersInRow === 1
        ? 50
        : 15 + (playerIndex * (70 / Math.max(playersInRow - 1, 1)));

      // Y position: 
      // Home team: GK at bottom (92%), FWD near center (58%)
      // Away team: GK at top (8%), FWD near center (42%)
      let y: number;
      if (isHomeTeam) {
        y = 92 - (rowIndex * (34 / Math.max(rowCount - 1, 1)));
      } else {
        y = 8 + (rowIndex * (34 / Math.max(rowCount - 1, 1)));
      }

      positions.push({ player, x, y });
    });
  });

  return positions;
};

const VerticalFootballField = memo(function VerticalFootballField({ 
  homeTeam, 
  awayTeam, 
  onPlayerClick 
}: VerticalFootballFieldProps) {
  const homePositions = calculateVerticalPositions(homeTeam.initialLineup, true);
  const awayPositions = calculateVerticalPositions(awayTeam.initialLineup, false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Away team header (top) */}
      <div className="flex items-center gap-2 mb-2 px-2">
        {awayTeam.logo && (
          <img src={awayTeam.logo} alt={awayTeam.name} className="w-5 h-5 object-contain" />
        )}
        <span className="text-xs font-medium text-foreground">{awayTeam.name}</span>
        <span className="text-[10px] text-muted-foreground">({awayTeam.formation})</span>
      </div>

      {/* Vertical Football Field SVG - Dark Purple Gaming Effect */}
      <svg
        viewBox="0 0 68 105"
        className="w-full rounded-lg overflow-hidden"
      >
        {/* Dark purple gaming gradient background */}
        <defs>
          <linearGradient id="gaming-field-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 50%, 15%)" />
            <stop offset="50%" stopColor="hsl(265, 45%, 12%)" />
            <stop offset="100%" stopColor="hsl(270, 50%, 15%)" />
          </linearGradient>
          <pattern id="gaming-pattern" x="0" y="0" width="68" height="10" patternUnits="userSpaceOnUse">
            <rect width="68" height="5" fill="hsl(265, 45%, 13%)" />
            <rect y="5" width="68" height="5" fill="hsl(265, 45%, 11%)" />
          </pattern>
          {/* Glow effect for players */}
          <filter id="player-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="68" height="105" fill="url(#gaming-field-gradient)" />
        <rect width="68" height="105" fill="url(#gaming-pattern)" opacity="0.5" />

        {/* Field markings - Purple tint */}
        <g stroke="hsla(270, 60%, 60%, 0.4)" strokeWidth="0.3" fill="none">
          {/* Outer boundary */}
          <rect x="2" y="2" width="64" height="101" rx="0.5" />
          
          {/* Center line */}
          <line x1="2" y1="52.5" x2="66" y2="52.5" />
          
          {/* Center circle */}
          <circle cx="34" cy="52.5" r="9" />
          <circle cx="34" cy="52.5" r="0.5" fill="hsla(270, 60%, 60%, 0.4)" />
          
          {/* Top penalty area (Away) */}
          <rect x="14" y="2" width="40" height="16" />
          <rect x="22" y="2" width="24" height="6" />
          <circle cx="34" cy="12" r="0.5" fill="hsla(270, 60%, 60%, 0.4)" />
          <path d="M 26 18 Q 34 22 42 18" />
          
          {/* Bottom penalty area (Home) */}
          <rect x="14" y="87" width="40" height="16" />
          <rect x="22" y="97" width="24" height="6" />
          <circle cx="34" cy="93" r="0.5" fill="hsla(270, 60%, 60%, 0.4)" />
          <path d="M 26 87 Q 34 83 42 87" />

          {/* Corner arcs */}
          <path d="M 2 4 A 2 2 0 0 0 4 2" />
          <path d="M 64 2 A 2 2 0 0 0 66 4" />
          <path d="M 2 101 A 2 2 0 0 1 4 103" />
          <path d="M 64 103 A 2 2 0 0 1 66 101" />
        </g>

        {/* Away team players (top) - Smaller icons */}
        {awayPositions.map(({ player, x, y }, index) => (
          <g
            key={`away-${index}`}
            transform={`translate(${x * 0.64 + 2}, ${y})`}
            onClick={() => onPlayerClick(player.player_id)}
            className={player.player_id ? 'cursor-pointer' : ''}
            filter="url(#player-glow)"
          >
            <circle r="2.8" fill="hsl(0, 72%, 51%)" stroke="hsla(0, 0%, 100%, 0.6)" strokeWidth="0.3" />
            <text
              y="0.8"
              textAnchor="middle"
              fill="white"
              fontSize="2.2"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {player.number}
            </text>
            <text
              y="5.5"
              textAnchor="middle"
              fill="hsla(0, 0%, 100%, 0.9)"
              fontSize="1.8"
              className="pointer-events-none"
            >
              {player.name.split(' ').pop()?.substring(0, 8)}
            </text>
          </g>
        ))}

        {/* Home team players (bottom) - Smaller icons */}
        {homePositions.map(({ player, x, y }, index) => (
          <g
            key={`home-${index}`}
            transform={`translate(${x * 0.64 + 2}, ${y})`}
            onClick={() => onPlayerClick(player.player_id)}
            className={player.player_id ? 'cursor-pointer' : ''}
            filter="url(#player-glow)"
          >
            <circle r="2.8" fill="hsl(221, 83%, 53%)" stroke="hsla(0, 0%, 100%, 0.6)" strokeWidth="0.3" />
            <text
              y="0.8"
              textAnchor="middle"
              fill="white"
              fontSize="2.2"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {player.number}
            </text>
            <text
              y="5.5"
              textAnchor="middle"
              fill="hsla(0, 0%, 100%, 0.9)"
              fontSize="1.8"
              className="pointer-events-none"
            >
              {player.name.split(' ').pop()?.substring(0, 8)}
            </text>
          </g>
        ))}
      </svg>

      {/* Home team header (bottom) */}
      <div className="flex items-center gap-2 mt-2 px-2">
        {homeTeam.logo && (
          <img src={homeTeam.logo} alt={homeTeam.name} className="w-5 h-5 object-contain" />
        )}
        <span className="text-xs font-medium text-foreground">{homeTeam.name}</span>
        <span className="text-[10px] text-muted-foreground">({homeTeam.formation})</span>
      </div>
    </div>
  );
});

const SubstitutesSection = memo(function SubstitutesSection({ 
  homeTeam, 
  awayTeam, 
  onPlayerClick,
  t
}: SubstitutesSectionProps) {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');

  if (homeTeam.substitutes.length === 0 && awayTeam.substitutes.length === 0) {
    return null;
  }

  const currentTeam = activeTeam === 'home' ? homeTeam : awayTeam;

  const renderSubstitute = (player: LineupPlayer) => (
    <div
      key={player.id || player.name}
      onClick={() => onPlayerClick(player.player_id)}
      className={`flex items-center gap-3 py-3 px-4 transition-colors ${
        player.player_id ? 'hover:bg-muted/30 cursor-pointer' : ''
      }`}
    >
      <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
        {player.number}
      </span>
      <span className="text-sm text-foreground flex-1 truncate">{player.name}</span>
      <span className="text-[10px] text-muted-foreground uppercase">
        {player.position}
      </span>
    </div>
  );

  return (
    <div className="mt-6">
      {/* Header with Switch Bar */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium mb-3">{t('pages:match.lineups.substitutes')}</h3>
        
        {/* Team Switch Bar */}
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
          <button
            onClick={() => setActiveTeam('home')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              activeTeam === 'home'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {homeTeam.logo && (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-4 h-4 object-contain" />
            )}
            <span className="truncate">{homeTeam.name}</span>
          </button>
          <button
            onClick={() => setActiveTeam('away')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              activeTeam === 'away'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {awayTeam.logo && (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-4 h-4 object-contain" />
            )}
            <span className="truncate">{awayTeam.name}</span>
          </button>
        </div>
      </div>

      {/* Substitutes list with dividers */}
      <div className="divide-y divide-border">
        {currentTeam.substitutes.map(renderSubstitute)}
      </div>
    </div>
  );
});

export const MatchLineupSection = memo(function MatchLineupSection({ match }: MatchLineupSectionProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('pages');
  const { data: lineupData, isLoading } = useMatchLineup(match.id);

  const handlePlayerClick = useCallback((playerId: string | undefined) => {
    if (playerId) {
      navigate(`/player/${playerId}`);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <LoadingSpinner />
        <span className="text-muted-foreground">{t('match.lineups.loading')}</span>
      </div>
    );
  }

  if (!lineupData || !lineupData.homeTeam || !lineupData.awayTeam) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-lg font-medium text-muted-foreground">{t('match.lineups.comingSoon')}</span>
        <span className="text-sm text-muted-foreground/60 mt-1">{t('match.lineups.availableSoon')}</span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <VerticalFootballField
        homeTeam={lineupData.homeTeam}
        awayTeam={lineupData.awayTeam}
        onPlayerClick={handlePlayerClick}
      />

      <SubstitutesSection
        homeTeam={lineupData.homeTeam}
        awayTeam={lineupData.awayTeam}
        onPlayerClick={handlePlayerClick}
        t={t}
      />
    </div>
  );
});