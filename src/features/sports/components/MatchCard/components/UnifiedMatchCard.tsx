import React, { useMemo, type ComponentType } from "react";
import { TeamDisplay } from "./TeamDisplay";
import { DateTimeDisplay } from "./DateTimeDisplay";
import { StyledOddsDisplay } from "@/features/social-feed/components/shared/StyledOddsDisplay";
import { LiveMatchIndicator } from "./LiveMatchIndicator";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { ReactionBar } from "@/features/social-feed/components/shared/ReactionBar";
import { CommentSection, type Comment } from "@/features/social-feed/components/shared/CommentSection";
import { Badge } from "@/components/ui/badge";

import { getSportIcon } from "@/lib/sportIcons";
import { parseStatesScore } from "@/features/sports/utils/payloadParser";
import { getMatchStatus } from "@/features/sports/types/rpc";
import type { RpcMatchItem } from "@/features/sports/types/rpc";
import type { ReactionCounts } from '@/types/feed';

export type UnifiedMatchCardVariant = 'feed' | 'compact' | 'league';

interface UnifiedMatchCardProps {
  match: RpcMatchItem;
  onClick?: () => void;
  variant?: UnifiedMatchCardVariant;
  // Feed variant props
  reactions?: ReactionCounts;
  comments?: Comment[];
  showComments?: boolean;
  isLoadingComments?: boolean;
  onAddComment?: (text: string) => void;
  onToggleComments?: () => void;
  onLike?: () => void;
  showOdds?: boolean;
}

export function UnifiedMatchCard({ 
  match, 
  onClick,
  variant = 'feed',
  reactions,
  comments = [],
  showComments = false,
  isLoadingComments = false,
  onAddComment,
  onToggleComments,
  onLike,
  showOdds = true
}: UnifiedMatchCardProps) {
  // Get sport icon directly from database icon_name
  const SportIcon = useMemo(() => getSportIcon(match.sport.icon_name), [match.sport.icon_name]);
  const hideImages = match.sport.slug === 'tennis' || match.sport.slug === 'volleyball';

  // Match status from the native RPC fields
  const matchStatus = useMemo(() => getMatchStatus(match), [match]);

  // Parse scores from states if available
  const parsedScore = useMemo(() => {
    if (match.states) {
      return parseStatesScore(match.states, match.sport.slug);
    }
    return undefined;
  }, [match.states, match.sport.slug]);

  // Team data for components
  const teamA = useMemo(() => ({
    name: match.home.name,
    image: match.home.logo || undefined,
  }), [match.home]);

  const teamB = useMemo(() => ({
    name: match.away.name,
    image: match.away.logo || undefined,
  }), [match.away]);

  // Participants for odds display
  const participants = useMemo(() => [teamA, teamB], [teamA, teamB]);

  // Has Azuro ID for odds
  const hasAzuroId = !!match.azuro_game_id;

  // Render based on variant
  if (variant === 'compact') {
    return (
      <CompactVariant
        match={match}
        onClick={onClick}
        SportIcon={SportIcon}
        hideImages={hideImages}
        matchStatus={matchStatus}
        teamA={teamA}
        teamB={teamB}
        parsedScore={parsedScore}
        participants={participants}
        hasAzuroId={hasAzuroId}
        showOdds={showOdds}
      />
    );
  }

  if (variant === 'league') {
    return (
      <LeagueVariant
        match={match}
        onClick={onClick}
        SportIcon={SportIcon}
        hideImages={hideImages}
        teamA={teamA}
        teamB={teamB}
        participants={participants}
        hasAzuroId={hasAzuroId}
      />
    );
  }

  // Default: Feed variant
  return (
    <FeedVariant
      match={match}
      onClick={onClick}
      SportIcon={SportIcon}
      hideImages={hideImages}
      matchStatus={matchStatus}
      teamA={teamA}
      teamB={teamB}
      parsedScore={parsedScore}
      participants={participants}
      reactions={reactions}
      comments={comments}
      showComments={showComments}
      isLoadingComments={isLoadingComments}
      onAddComment={onAddComment}
      onToggleComments={onToggleComments}
      onLike={onLike}
    />
  );
}

// Internal components for each variant
interface VariantProps {
  match: RpcMatchItem;
  onClick?: () => void;
  SportIcon: ComponentType<{ className?: string }>;
  hideImages: boolean;
  teamA: { name: string; image?: string };
  teamB: { name: string; image?: string };
  participants: { name: string; image?: string }[];
  hasAzuroId: boolean;
}

interface FeedVariantProps extends Omit<VariantProps, 'hasAzuroId' | 'participants'> {
  matchStatus: ReturnType<typeof getMatchStatus>;
  parsedScore?: { home: number; away: number; breakdown?: { label: string; home: number; away: number }[] };
  participants: { name: string; image?: string }[];
  reactions?: ReactionCounts;
  comments: Comment[];
  showComments: boolean;
  isLoadingComments: boolean;
  onAddComment?: (text: string) => void;
  onToggleComments?: () => void;
  onLike?: () => void;
}

function FeedVariant({
  match,
  onClick,
  SportIcon,
  hideImages,
  matchStatus,
  teamA,
  teamB,
  parsedScore,
  participants,
  reactions,
  comments,
  showComments,
  isLoadingComments,
  onAddComment,
  onToggleComments,
  onLike,
}: FeedVariantProps) {
  return (
    <div 
      className="bg-background border-b border-border/50 p-4 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Sport + League + Stage/Round */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SportIcon className="h-4 w-4 text-muted-foreground" />
          {match.league.logo && (
            <img 
              src={match.league.logo}
              alt=""
              className="h-4 w-4 object-contain rounded-sm"
            />
          )}
          {match.league.name && (
            <span className="text-sm text-muted-foreground font-medium">
              {match.league.name}
            </span>
          )}
        </div>
        
        {/* Stage / Round */}
        {(match.stage || match.round) && (
          <span className="text-xs text-muted-foreground">
            {match.stage}
            {match.stage && match.round && ' • '}
            {match.round}
          </span>
        )}
      </div>

      {/* Live Indicator */}
      {matchStatus.isLive && (
        <div className="mb-3">
          <LiveMatchIndicator 
            isLive={true}
            score={parsedScore ? { home: parsedScore.home, away: parsedScore.away } : undefined}
            viewMode="grid"
          />
        </div>
      )}

      {/* Finished Badge with detailed scores */}
      {matchStatus.isFinished && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Finished
            </Badge>
            {parsedScore && (
              <span className="text-sm font-semibold">
                {parsedScore.home} - {parsedScore.away}
              </span>
            )}
          </div>
          {/* Score breakdown */}
          {parsedScore?.breakdown && parsedScore.breakdown.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>(</span>
              {parsedScore.breakdown.map((period, idx) => (
                <span key={idx}>
                  {period.home}-{period.away}
                  {idx < parsedScore.breakdown!.length - 1 && ', '}
                </span>
              ))}
              <span>)</span>
            </div>
          )}
        </div>
      )}
      
      {/* Date/Time - only for upcoming matches */}
      {matchStatus.isUpcoming && (
        <div className="mb-3">
          <DateTimeDisplay 
            startingAt={match.start_iso} 
            viewMode="grid"
          />
        </div>
      )}
      
      {/* Teams with scores */}
      <div className="mb-4">
        <TeamDisplay 
          teamA={teamA}
          teamB={teamB}
          viewMode="grid"
          score={matchStatus.isLive ? (parsedScore ? { home: parsedScore.home, away: parsedScore.away } : undefined) : undefined}
          hideImages={hideImages}
        />
      </div>
      
      {/* Odds */}
      <div className="mb-4">
        <StyledOddsDisplay 
          gameId={match.azuro_game_id}
          participants={participants}
          sport={{ name: match.sport.name, slug: match.sport.slug }}
          league={{ name: match.league.name, slug: match.league.slug, logo: match.league.logo || undefined }}
          startsAt={match.start_iso}
        />
      </div>

      {/* Reaction Bar */}
      <ReactionBar
        likes={reactions?.likes || 0}
        comments={reactions?.comments || 0}
        userLiked={reactions?.userLiked || false}
        postId={match.stg_id}
        onLike={onLike}
        onComment={onToggleComments}
      />

      {/* Comments Section */}
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

interface CompactVariantProps extends Omit<VariantProps, 'participants'> {
  matchStatus: ReturnType<typeof getMatchStatus>;
  parsedScore?: { home: number; away: number };
  participants: { name: string; image?: string }[];
  showOdds: boolean;
}

function CompactVariant({
  match,
  onClick,
  SportIcon,
  hideImages,
  matchStatus,
  teamA,
  teamB,
  parsedScore,
  participants,
  hasAzuroId,
  showOdds,
}: CompactVariantProps) {
  return (
    <div 
      className="bg-card border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Sport + League */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <SportIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {match.league.name && (
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
              {match.league.name}
            </span>
          )}
        </div>
        
        {/* Live indicator or time */}
        {matchStatus.isLive ? (
          <LiveMatchIndicator isLive={true} viewMode="list" />
        ) : (
          <DateTimeDisplay startingAt={match.start_iso} viewMode="list" />
        )}
      </div>

      {/* Teams */}
      <div className="mb-2">
        <TeamDisplay 
          teamA={teamA}
          teamB={teamB}
          viewMode="list"
          score={matchStatus.isLive || matchStatus.isFinished ? parsedScore : undefined}
          hideImages={hideImages}
        />
      </div>
      
      {/* Odds */}
      {showOdds && hasAzuroId && (
        <StyledOddsDisplay 
          gameId={match.azuro_game_id}
          participants={participants}
          sport={{ name: match.sport.name, slug: match.sport.slug }}
          league={{ name: match.league.name, slug: match.league.slug, logo: match.league.logo || undefined }}
          startsAt={match.start_iso}
        />
      )}
    </div>
  );
}

function LeagueVariant({
  match,
  onClick,
  SportIcon,
  hideImages,
  teamA,
  teamB,
  participants,
  hasAzuroId,
}: VariantProps) {
  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Sport + League + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SportIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            {match.league.name}
          </span>
        </div>
        <MatchStatusBadge statusLong={match.match_status_long} />
      </div>

      {/* Date/Time */}
      <div className="mb-3">
        <DateTimeDisplay 
          startingAt={match.start_iso} 
          viewMode="grid"
        />
      </div>

      {/* Teams */}
      <div className="mb-4">
        <TeamDisplay 
          teamA={teamA}
          teamB={teamB}
          viewMode="grid"
          hideImages={hideImages}
        />
      </div>

      {/* Odds */}
      {hasAzuroId ? (
        <StyledOddsDisplay 
          gameId={match.azuro_game_id}
          participants={participants}
          sport={{ name: match.sport.name, slug: match.sport.slug }}
          league={{ name: match.league.name, slug: match.league.slug, logo: match.league.logo || undefined }}
          startsAt={match.start_iso}
        />
      ) : (
        <div className="text-center py-2 text-xs text-muted-foreground">
          Odds not available
        </div>
      )}
    </div>
  );
}
