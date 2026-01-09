import React, { useMemo } from "react";
import { getSportById } from "@/lib/sportsMapping";
import { parseStatesScore, ParsedScore } from "@/features/sports/utils/payloadParser";
import { Badge } from "@/components/ui/badge";
import { DateTimeDisplay } from "./DateTimeDisplay";
import type { MatchStates } from "@/features/sports/types/supabase";

interface FinishedMatchCardProps {
  match: {
    id: string;
    gameId: string;
    startsAt: string | number;
    league?: { name?: string; slug?: string };
    sport?: { sportId?: string; slug?: string; name?: string };
    participants?: Array<{ name?: string; image?: string; teamId?: string }>;
    matchStates?: MatchStates;
  };
  onClick?: () => void;
  highlightTeamId?: string;
}

export function FinishedMatchCard({ match, onClick, highlightTeamId }: FinishedMatchCardProps) {
  // Extract team data
  const teamData = useMemo(() => ({
    teamA: match.participants?.[0] ? {
      name: match.participants[0].name,
      image: match.participants[0].image,
      teamId: match.participants[0].teamId
    } : undefined,
    teamB: match.participants?.[1] ? {
      name: match.participants[1].name,
      image: match.participants[1].image,
      teamId: match.participants[1].teamId
    } : undefined
  }), [match.participants]);

  // Get sport info
  const sportData = useMemo(() => {
    const sport = match.sport;
    const sportInfo = getSportById(sport?.sportId || sport?.slug);
    const hideImages = sportInfo.slug === 'tennis' || sportInfo.slug === 'volleyball';
    return { sportInfo, hideImages, sportSlug: sportInfo.slug };
  }, [match.sport]);

  // Parse score from matchStates (from sports_data.match)
  const parsedScore = useMemo((): ParsedScore | undefined => {
    if (match.matchStates) {
      return parseStatesScore(match.matchStates, sportData.sportSlug);
    }
    return undefined;
  }, [match.matchStates, sportData.sportSlug]);

  // Determine match result for highlighted team
  const matchResult = useMemo(() => {
    if (!highlightTeamId || !parsedScore) return null;
    
    const isHomeTeam = teamData.teamA?.teamId === highlightTeamId;
    const isAwayTeam = teamData.teamB?.teamId === highlightTeamId;
    
    if (!isHomeTeam && !isAwayTeam) return null;
    
    const teamScore = isHomeTeam ? parsedScore.home : parsedScore.away;
    const opponentScore = isHomeTeam ? parsedScore.away : parsedScore.home;
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  }, [highlightTeamId, parsedScore, teamData]);

  // Check if it's basketball for quarter display
  const isBasketball = sportData.sportSlug === 'basketball';

  return (
    <div 
      className="bg-background border-b border-border/50 p-4 hover:bg-muted/20 transition-colors duration-200 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Win/Loss/Draw indicator bar */}
      {matchResult && (
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            matchResult === 'win' ? 'bg-green-500' :
            matchResult === 'loss' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}
        />
      )}
      {/* Header: Sport icon + League + Result badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {sportData.sportInfo.icon && (
            <sportData.sportInfo.icon className="h-4 w-4 text-muted-foreground" />
          )}
          {match.league?.name && (
            <span className="text-sm text-muted-foreground font-medium">
              {match.league.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {matchResult && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                matchResult === 'win' ? 'bg-green-500/20 text-green-500' :
                matchResult === 'loss' ? 'bg-red-500/20 text-red-500' :
                'bg-yellow-500/20 text-yellow-500'
              }`}
            >
              {matchResult === 'win' ? 'W' : matchResult === 'loss' ? 'L' : 'D'}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            Full Time
          </Badge>
        </div>
      </div>

      {/* Date/Time */}
      <div className="mb-3">
        <DateTimeDisplay startingAt={match.startsAt} viewMode="grid" />
      </div>

      {/* Teams with scores */}
      <div className="space-y-2">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!sportData.hideImages && teamData.teamA?.image && (
              <img 
                src={teamData.teamA.image} 
                alt={teamData.teamA.name || ''} 
                className="w-6 h-6 object-contain"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{teamData.teamA?.name || 'Team A'}</span>
              {/* Basketball quarter breakdown for home team */}
              {isBasketball && parsedScore?.breakdown && parsedScore.breakdown.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {parsedScore.breakdown.map((period, idx) => (
                    <span key={idx}>{period.label}: {period.home}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {parsedScore && (
            <span className={`text-lg font-bold tabular-nums ${parsedScore.home > parsedScore.away ? 'text-foreground' : 'text-muted-foreground'}`}>
              {parsedScore.home}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!sportData.hideImages && teamData.teamB?.image && (
              <img 
                src={teamData.teamB.image} 
                alt={teamData.teamB.name || ''} 
                className="w-6 h-6 object-contain"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{teamData.teamB?.name || 'Team B'}</span>
              {/* Basketball quarter breakdown for away team */}
              {isBasketball && parsedScore?.breakdown && parsedScore.breakdown.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {parsedScore.breakdown.map((period, idx) => (
                    <span key={idx}>{period.label}: {period.away}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {parsedScore && (
            <span className={`text-lg font-bold tabular-nums ${parsedScore.away > parsedScore.home ? 'text-foreground' : 'text-muted-foreground'}`}>
              {parsedScore.away}
            </span>
          )}
        </div>
      </div>

      {/* Score breakdown for non-basketball sports */}
      {!isBasketball && parsedScore?.breakdown && parsedScore.breakdown.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {parsedScore.breakdown.map((period, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="font-medium">{period.label}:</span>
                <span>{period.home}-{period.away}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
