import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GiSoccerBall, GiRunningShoe } from 'react-icons/gi';
import { cn } from '@/lib/utils';

// Helper functions for null-safe formatting
const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined) return '-';
  return decimals > 0 ? value.toFixed(decimals) : value.toString();
};

const formatRatio = (numerator: number | null | undefined, denominator: number | null | undefined): string => {
  const num = numerator ?? 0;
  const den = denominator ?? 0;
  return `${num}/${den}`;
};

export interface PlayerBoxScoreStats {
  goalsScored?: number | null;
  assists?: number | null;
  shotsTotal?: number | null;
  shotsOnTarget?: number | null;
  shotsAccuracy?: string | null;
  passesTotal?: number | null;
  passesSuccessful?: number | null;
  passesAccuracy?: string | null;
  passesKey?: number | null;
  tacklesTotal?: number | null;
  interceptionsTotal?: number | null;
  duelsTotal?: number | null;
  duelsWon?: number | null;
  duelSuccessRate?: string | null;
  dribblesTotal?: number | null;
  dribblesSuccessful?: number | null;
  cardsYellow?: number | null;
  cardsRed?: number | null;
  expectedGoals?: number | null;
  expectedAssists?: number | null;
}

export interface BoxScorePlayer {
  id: number;
  name: string;
  fullName: string;
  logo: string;
  matchRating: string | null;
  shirtNumber: number;
  isCaptain: boolean;
  position: string;
  minutesPlayed: number;
  isSubstitute: boolean;
  offsides?: number | null;
  statistics: PlayerBoxScoreStats;
}

interface BoxScorePlayerCardProps {
  player: BoxScorePlayer;
  isLast?: boolean;
}

export const BoxScorePlayerCard: React.FC<BoxScorePlayerCardProps> = ({ 
  player,
  isLast = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = player.statistics || {};
  const rating = player.matchRating ? parseFloat(player.matchRating) : null;
  
  const getRatingColor = (r: number | null) => {
    if (r === null) return 'text-muted-foreground';
    if (r >= 8) return 'text-emerald-500';
    if (r >= 7) return 'text-green-500';
    if (r >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={cn(!isLast && !isExpanded && "border-b border-border")}>
      {/* Main Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-3 flex items-center gap-3 hover:bg-muted/30 transition-colors active:bg-muted/50"
      >
        {/* Shirt Number */}
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
          {player.shirtNumber}
        </div>

        {/* Player Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground text-sm truncate">{player.name}</span>
            {player.isCaptain && (
              <span className="text-[10px] font-bold text-yellow-600 bg-yellow-500/20 px-1 rounded">C</span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {player.position} • {player.minutesPlayed}'
          </div>
        </div>

        {/* Quick Stats Icons */}
        <div className="flex items-center gap-2">
          {(stats.goalsScored ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 text-emerald-500">
              <GiSoccerBall className="h-3 w-3" />
              <span className="text-xs font-semibold">{stats.goalsScored}</span>
            </div>
          )}
          {(stats.assists ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 text-blue-500">
              <GiRunningShoe className="h-3 w-3" />
              <span className="text-xs font-semibold">{stats.assists}</span>
            </div>
          )}
          {(stats.cardsYellow ?? 0) > 0 && <div className="w-2.5 h-3.5 bg-yellow-500 rounded-[2px]" />}
          {(stats.cardsRed ?? 0) > 0 && <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px]" />}
        </div>

        {/* Rating */}
        <div className={cn("text-sm font-bold tabular-nums min-w-[32px] text-right", getRatingColor(rating))}>
          {player.minutesPlayed > 0 ? (player.matchRating ?? '-') : '-'}
        </div>

        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded Stats */}
      {isExpanded && (
        <div className={cn("px-3 pb-3 bg-muted/20", !isLast && "border-b border-border")}>
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-3 text-[11px]">
            <StatCell label="Shots" value={formatRatio(stats.shotsOnTarget, stats.shotsTotal)} />
            <StatCell label="Passes" value={stats.passesAccuracy ?? '-'} />
            <StatCell label="Duels" value={formatRatio(stats.duelsWon, stats.duelsTotal)} />
            <StatCell label="Tackles" value={formatNumber(stats.tacklesTotal)} />
            
            <StatCell label="xG" value={formatNumber(stats.expectedGoals, 2)} />
            <StatCell label="xA" value={formatNumber(stats.expectedAssists, 2)} />
            <StatCell label="Key" value={formatNumber(stats.passesKey)} />
            <StatCell label="Intcpt" value={formatNumber(stats.interceptionsTotal)} />
            
            <StatCell label="Dribbles" value={formatRatio(stats.dribblesSuccessful, stats.dribblesTotal)} />
            <StatCell label="Offside" value={formatNumber(player.offsides)} />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-muted-foreground mb-0.5">{label}</div>
    <div className="font-semibold text-foreground">{value}</div>
  </div>
);
