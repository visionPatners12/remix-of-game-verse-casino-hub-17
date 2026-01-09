import React, { useMemo } from "react";
import { TeamDisplay } from "./TeamDisplay";
import { DateTimeDisplay } from "./DateTimeDisplay";
import { StyledOddsDisplay } from "@/features/social-feed/components/shared/StyledOddsDisplay";
import { LiveMatchIndicator } from "./LiveMatchIndicator";
import { getSportById } from "@/lib/sportsMapping";
import type { MatchCardProps } from "@/features/sports/types";

export function CompactMatchCard({ match, onClick }: MatchCardProps) {
  // Memoize team data extraction
  const teamData = useMemo(() => ({
    teamA: match.participants?.[0] ? {
      name: match.participants[0].name,
      image: match.participants[0].image
    } : undefined,
    teamB: match.participants?.[1] ? {
      name: match.participants[1].name,
      image: match.participants[1].image
    } : undefined
  }), [match.participants]);

  // Memoize match status and score
  const matchInfo = useMemo(() => {
    const isLive = match.status === "inplay" || 
                   match.result_info === "live" || 
                   (match.scores && Object.keys(match.scores).length > 0);
                   
    const scores = match.scores as { localteam_score?: number; visitorteam_score?: number } | undefined;
    const score = scores ? {
      home: scores.localteam_score || 0,
      away: scores.visitorteam_score || 0
    } : undefined;

    return { isLive, score };
  }, [match.status, match.result_info, match.scores]);

  // Memoize sport info
  const sportData = useMemo(() => {
    const sport = match.sport as { sportId?: string; slug?: string } | undefined;
    const sportInfo = getSportById(sport?.sportId || sport?.slug);
    const hideImages = sportInfo.slug === 'tennis' || sportInfo.slug === 'volleyball';
    
    return { sportInfo, hideImages };
  }, [match.sport]);

  // Memoize filtered participants for StyledOddsDisplay
  const participants = useMemo(() => 
    [teamData.teamA, teamData.teamB].filter(Boolean), 
    [teamData.teamA, teamData.teamB]
  );

  return (
    <div className="bg-background border-b border-border/50 p-3 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
         onClick={onClick}>
      
      {/* En-tête Sport et Ligue */}
      <div className="flex items-center gap-1.5 mb-2">
        {sportData.sportInfo.icon && (
          <sportData.sportInfo.icon className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {(match.league as { name?: string })?.name && (
          <span className="text-xs text-muted-foreground font-medium">
            {(match.league as { name?: string }).name}
          </span>
        )}
      </div>

      {/* Indicateur Live */}
      {matchInfo.isLive && (
        <div className="mb-2">
          <LiveMatchIndicator 
            isLive={matchInfo.isLive}
            score={matchInfo.score}
            viewMode="grid"
          />
        </div>
      )}
      
      {/* Date/Time - seulement si pas en live */}
      {!matchInfo.isLive && (
        <div className="mb-2">
          <DateTimeDisplay 
            startingAt={match.startsAt as string | number} 
            viewMode="grid"
          />
        </div>
      )}
      
      {/* Teams avec scores */}
      <div className="mb-2">
        <TeamDisplay 
          teamA={teamData.teamA}
          teamB={teamData.teamB}
          viewMode="grid"
          score={matchInfo.isLive ? matchInfo.score : undefined}
          hideImages={sportData.hideImages}
        />
      </div>
      
      {/* Cotes */}
      <div>
        <StyledOddsDisplay 
          gameId={match.gameId}
          participants={participants}
          sport={typeof match.sport === 'object' ? { name: (match.sport as any).name || '', slug: (match.sport as any).slug || '' } : undefined}
          league={typeof match.league === 'object' ? { name: (match.league as any).name || '', slug: (match.league as any).slug || '', logo: (match.league as any).logo || (match.league as any).image_path } : undefined}
          startsAt={match.startsAt as string}
        />
      </div>
    </div>
  );
}
