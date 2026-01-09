import React, { useMemo } from "react";
import { TeamDisplay } from "./TeamDisplay";
import { DateTimeDisplay } from "./DateTimeDisplay";
import { StyledOddsDisplay } from "@/features/social-feed/components/shared/StyledOddsDisplay";
import { LiveMatchIndicator } from "./LiveMatchIndicator";
import { ReactionBar } from "@/features/social-feed/components/shared/ReactionBar";
import { CommentSection, type Comment } from "@/features/social-feed/components/shared/CommentSection";
import { Badge } from "@/components/ui/badge";

import { getSportIcon } from "@/lib/sportIcons";
import { parseStatesScore } from "@/features/sports/utils/payloadParser";

import type { MatchCardProps } from "@/features/sports/types";
import type { ReactionCounts } from '@/types/feed';

interface FeedMatchCardProps extends MatchCardProps {
  reactions?: ReactionCounts;
  comments?: Comment[];
  showComments?: boolean;
  isLoadingComments?: boolean;
  onAddComment?: (text: string) => void;
  onToggleComments?: () => void;
  onLike?: () => void;
}

export function FeedMatchCard({ 
  match, 
  onClick,
  reactions,
  comments = [],
  showComments = false,
  isLoadingComments = false,
  onAddComment,
  onToggleComments,
  onLike
}: FeedMatchCardProps) {
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

  // Memoize match state (live, finished, upcoming)
  const matchState = useMemo(() => {
    const status = match.status?.toLowerCase() || '';
    const isLive = status === 'inplay' || status === 'live' || match.result_info === 'live';
    const isFinished = status === 'finished' || status === 'ft' || status === 'aet' || status === 'pen';
    const isUpcoming = !isLive && !isFinished;

    return { isLive, isFinished, isUpcoming };
  }, [match.status, match.result_info]);

  // Memoize scores
  const matchScores = useMemo(() => {
    const scores = match.scores as { localteam_score?: number; visitorteam_score?: number } | undefined;
    if (!scores) return undefined;
    
    return {
      home: scores.localteam_score || 0,
      away: scores.visitorteam_score || 0
    };
  }, [match.scores]);

  // Memoize sport info
  const sportData = useMemo(() => {
    const sport = match.sport as { sportId?: string; slug?: string; icon_name?: string | null } | undefined;
    const SportIcon = getSportIcon(sport?.icon_name);
    const sportSlug = sport?.slug || '';
    const hideImages = sportSlug === 'tennis' || sportSlug === 'volleyball';
    
    return { SportIcon, sportSlug, hideImages };
  }, [match.sport]);

  // Parse detailed scores for finished matches (quarters, periods, sets, etc.)
  const parsedScore = useMemo(() => {
    const matchStates = (match as { matchStates?: Record<string, unknown> }).matchStates;
    if (matchState.isFinished && matchStates) {
      return parseStatesScore(matchStates, sportData.sportSlug);
    }
    return undefined;
  }, [matchState.isFinished, match, sportData.sportSlug]);


  // Memoize filtered participants for StyledOddsDisplay
  const participants = useMemo(() => 
    [teamData.teamA, teamData.teamB].filter(Boolean), 
    [teamData.teamA, teamData.teamB]
  );

  return (
    <div className="bg-background border-b border-border/50 p-4 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
         onClick={onClick}>
      
      {/* En-tête Sport et Ligue */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Sport + League */}
        <div className="flex items-center gap-2">
          <sportData.SportIcon className="h-4 w-4 text-muted-foreground" />
          {(match.league as { logo?: string })?.logo && (
            <img 
              src={(match.league as { logo?: string }).logo}
              alt=""
              className="h-4 w-4 object-contain rounded-sm"
            />
          )}
          {(match.league as { name?: string })?.name && (
            <span className="text-sm text-muted-foreground font-medium">
              {(match.league as { name?: string }).name}
            </span>
          )}
        </div>
        
        {/* Right: Stage / Round */}
        {((match as { stage?: string | null }).stage || (match as { round?: string | null }).round) && (
          <span className="text-xs text-muted-foreground">
            {(match as { stage?: string | null }).stage}
            {(match as { stage?: string | null }).stage && (match as { round?: string | null }).round && ' • '}
            {(match as { round?: string | null }).round}
          </span>
        )}
      </div>

      {/* Live Indicator */}
      {matchState.isLive && (
        <div className="mb-3">
          <LiveMatchIndicator 
            isLive={matchState.isLive}
            score={matchScores}
            viewMode="grid"
          />
        </div>
      )}

      {/* Status Badge - Finished */}
      {matchState.isFinished && (
        <div className="mb-3">
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Terminé
          </Badge>
        </div>
      )}
      
      {/* Date/Time - only for upcoming matches */}
      {matchState.isUpcoming && (
        <div className="mb-3">
          <DateTimeDisplay 
            startingAt={match.startsAt as string | number} 
            viewMode="grid"
          />
        </div>
      )}

      {/* Finished Match - Teams with inline scores */}
      {matchState.isFinished && (
        <div className="mb-4">
          {/* Teams with scores inline */}
          <div className="space-y-2">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {!sportData.hideImages && teamData.teamA?.image && (
                  <img 
                    src={teamData.teamA.image} 
                    alt={teamData.teamA.name || ''} 
                    className="w-6 h-6 object-contain rounded-sm"
                  />
                )}
                <span className={`text-sm truncate ${
                  (parsedScore?.home ?? matchScores?.home ?? 0) > (parsedScore?.away ?? matchScores?.away ?? 0) 
                    ? 'font-semibold text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {teamData.teamA?.name || 'Team A'}
                </span>
              </div>
              <span className={`text-lg tabular-nums ${
                (parsedScore?.home ?? matchScores?.home ?? 0) > (parsedScore?.away ?? matchScores?.away ?? 0) 
                  ? 'font-bold text-foreground' 
                  : 'font-medium text-muted-foreground'
              }`}>
                {parsedScore?.home ?? matchScores?.home ?? 0}
              </span>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {!sportData.hideImages && teamData.teamB?.image && (
                  <img 
                    src={teamData.teamB.image} 
                    alt={teamData.teamB.name || ''} 
                    className="w-6 h-6 object-contain rounded-sm"
                  />
                )}
                <span className={`text-sm truncate ${
                  (parsedScore?.away ?? matchScores?.away ?? 0) > (parsedScore?.home ?? matchScores?.home ?? 0) 
                    ? 'font-semibold text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {teamData.teamB?.name || 'Team B'}
                </span>
              </div>
              <span className={`text-lg tabular-nums ${
                (parsedScore?.away ?? matchScores?.away ?? 0) > (parsedScore?.home ?? matchScores?.home ?? 0) 
                  ? 'font-bold text-foreground' 
                  : 'font-medium text-muted-foreground'
              }`}>
                {parsedScore?.away ?? matchScores?.away ?? 0}
              </span>
            </div>
          </div>
          
          {/* Score breakdown with labels */}
          {parsedScore?.breakdown && parsedScore.breakdown.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
              {parsedScore.breakdown.map((period, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {period.label && <span className="font-medium">{period.label}:</span>}
                  <span>{period.home}-{period.away}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Teams - LIVE & UPCOMING only */}
      {!matchState.isFinished && (
        <div className="mb-4">
          <TeamDisplay 
            teamA={teamData.teamA}
            teamB={teamData.teamB}
            viewMode="grid"
            score={matchState.isLive ? matchScores : undefined}
            hideImages={sportData.hideImages}
          />
        </div>
      )}
      
      {/* Cotes */}
      <div className="mb-4">
        <StyledOddsDisplay 
          gameId={match.gameId}
          participants={participants}
          sport={typeof match.sport === 'object' ? { name: (match.sport as any).name || '', slug: (match.sport as any).slug || '' } : undefined}
          league={typeof match.league === 'object' ? { name: (match.league as any).name || '', slug: (match.league as any).slug || '', logo: (match.league as any).logo || (match.league as any).image_path } : undefined}
          startsAt={match.startsAt as string}
        />
      </div>

      {/* Barre de réaction */}
      <ReactionBar
        likes={reactions?.likes || 0}
        comments={reactions?.comments || 0}
        userLiked={reactions?.userLiked || false}
        postId={match.id}
        onLike={onLike}
        onComment={onToggleComments}
      />

      {/* Section commentaires */}
      <div onClick={(e) => e.stopPropagation()}>
        <CommentSection
          comments={comments}
          onAddComment={onAddComment}
          showComments={showComments}
          isLoadingComments={isLoadingComments}
        />
      </div>

    </div>
  );
}