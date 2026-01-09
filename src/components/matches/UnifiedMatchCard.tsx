import React, { useMemo, type ComponentType } from "react";
import { TeamDisplay } from "@/features/sports/components/MatchCard/components/TeamDisplay";
import { DateTimeDisplay } from "@/features/sports/components/MatchCard/components/DateTimeDisplay";
import { StyledOddsDisplay } from "@/features/social-feed/components/shared/StyledOddsDisplay";
import { LiveMatchIndicator } from "@/features/sports/components/MatchCard/components/LiveMatchIndicator";
import { MatchStatusBadge } from "@/features/sports/components/MatchCard/components/MatchStatusBadge";
import { ReactionBar } from "@/features/social-feed/components/shared/ReactionBar";
import { CommentSection, type Comment } from "@/features/social-feed/components/shared/CommentSection";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { LiveMatchScore } from "./LiveMatchScore";

import { getSportIcon } from "@/lib/sportIcons";
import { parseStatesScore } from "@/features/sports/utils/payloadParser";
import { useLiveStats } from "@/features/sports/hooks/useLiveStats";
import { normalizeMatch, type UniversalMatch } from "./types";
import type { RpcMatchItem } from "@/features/sports/types/rpc";
import type { ReactionCounts } from '@/types/feed';

export type UnifiedMatchCardVariant = 'feed' | 'compact' | 'league';

export interface UnifiedMatchCardProps {
  /** Match data - accepts RpcMatchItem, Supabase row, or UniversalMatch */
  match: RpcMatchItem | UniversalMatch | Record<string, unknown>;
  onClick?: () => void;
  variant?: UnifiedMatchCardVariant;
  /** Team ID for result indicator (win/draw/loss) in team context */
  teamId?: string;
  // Feed variant props
  reactions?: ReactionCounts;
  comments?: Comment[];
  showComments?: boolean;
  isLoadingComments?: boolean;
  onAddComment?: (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => void;
  onToggleComments?: () => void;
  onLike?: () => void;
  showOdds?: boolean;
}

export function UnifiedMatchCard({ 
  match: rawMatch, 
  onClick,
  variant = 'feed',
  teamId,
  reactions,
  comments = [],
  showComments = false,
  isLoadingComments = false,
  onAddComment,
  onToggleComments,
  onLike,
  showOdds = true
}: UnifiedMatchCardProps) {
  // Normalize to universal format
  const match = useMemo(() => normalizeMatch(rawMatch as any), [rawMatch]);

  // Get sport icon from icon_name
  const SportIcon = useMemo(() => getSportIcon(match.sport.icon_name), [match.sport.icon_name]);
  const hideImages = match.sport.slug === 'tennis' || match.sport.slug === 'volleyball';

  // Parse scores from states if available
  const parsedScore = useMemo(() => {
    if (match.states) {
      return parseStatesScore(match.states, match.sport.slug);
    }
    return match.score;
  }, [match.states, match.sport.slug, match.score]);

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

  // Render based on variant
  if (variant === 'compact') {
    return (
      <CompactVariant
        match={match}
        onClick={onClick}
        SportIcon={SportIcon}
        hideImages={hideImages}
        teamA={teamA}
        teamB={teamB}
        parsedScore={parsedScore}
        participants={participants}
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
      />
    );
  }

  // Default: Feed variant - use hook at component level
  const isMobile = useIsMobile();
  
  return (
    <FeedVariant
      match={match}
      onClick={onClick}
      SportIcon={SportIcon}
      hideImages={hideImages}
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
      isMobile={isMobile}
      teamId={teamId}
    />
  );
}

// Internal components for each variant
interface VariantProps {
  match: UniversalMatch;
  onClick?: () => void;
  SportIcon: ComponentType<{ className?: string }>;
  hideImages: boolean;
  teamA: { name: string; image?: string };
  teamB: { name: string; image?: string };
  participants: { name: string; image?: string }[];
}

interface FeedVariantProps extends VariantProps {
  parsedScore?: { home: number; away: number; breakdown?: { label: string; home: number; away: number }[] };
  reactions?: ReactionCounts;
  comments: Comment[];
  showComments: boolean;
  isLoadingComments: boolean;
  onAddComment?: (text: string, gif?: { url: string; previewUrl?: string; width?: number; height?: number; alt?: string }) => void;
  onToggleComments?: () => void;
  onLike?: () => void;
  isMobile?: boolean;
  teamId?: string;
}

// Hook to get live score data for a match
function useLiveMatchData(match: UniversalMatch) {
  const gameData = useMemo(() => ({
    gameId: match.gameId,
    sport: { sportId: match.sport.id, slug: match.sport.slug },
    state: match.status.isLive ? 'Live' : undefined
  }), [match.gameId, match.sport.id, match.sport.slug, match.status.isLive]);

  const liveData = useLiveStats(gameData, match.sport.slug);
  
  return liveData;
}

function FeedVariant({
  match,
  onClick,
  SportIcon,
  hideImages,
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
  isMobile = false,
  teamId,
}: FeedVariantProps) {
  const isBasketball = match.sport.slug === 'basketball';
  const hasScore = match.status.isLive || match.status.isFinished;
  
  // Get live data for real-time updates
  const liveData = useLiveMatchData(match);
  const hasLiveData = match.status.isLive && liveData.isAvailable;
  
  // Determine score to display - prefer live data when available
  const displayScore = useMemo(() => {
    if (hasLiveData) {
      if (match.sport.slug === 'soccer' || match.sport.slug === 'football') {
        return {
          home: liveData.soccerGoals?.home ?? 0,
          away: liveData.soccerGoals?.away ?? 0
        };
      }
      if (match.sport.slug === 'basketball') {
        return {
          home: liveData.basketballTotal?.home ?? 0,
          away: liveData.basketballTotal?.away ?? 0,
          breakdown: liveData.basketballQuarters ? [
            { label: 'Q1', home: liveData.basketballQuarters.q1.home, away: liveData.basketballQuarters.q1.away },
            { label: 'Q2', home: liveData.basketballQuarters.q2.home, away: liveData.basketballQuarters.q2.away },
            { label: 'Q3', home: liveData.basketballQuarters.q3.home, away: liveData.basketballQuarters.q3.away },
            { label: 'Q4', home: liveData.basketballQuarters.q4.home, away: liveData.basketballQuarters.q4.away },
          ] : undefined
        };
      }
      if (match.sport.slug === 'tennis' || match.sport.slug === 'volleyball') {
        return {
          home: liveData.setsWon?.home ?? 0,
          away: liveData.setsWon?.away ?? 0
        };
      }
    }
    return parsedScore;
  }, [hasLiveData, liveData, match.sport.slug, parsedScore]);

  // Game time display for live matches
  const gameTimeDisplay = useMemo(() => {
    if (!hasLiveData) return null;
    
    if (match.sport.slug === 'soccer' || match.sport.slug === 'football') {
      const time = liveData.gameTime;
      if (time) return time.match(/^\d+$/) ? `${time}'` : time;
    }
    if (match.sport.slug === 'basketball') {
      const state = liveData.gameState;
      const time = liveData.gameTime;
      const stateMap: Record<string, string> = {
        'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4',
        'H1': '1H', 'H2': '2H', 'HT': 'HT', 'OT': 'OT'
      };
      return `${stateMap[state || ''] || state || ''}${time ? ` ${time}` : ''}`;
    }
    if (match.sport.slug === 'tennis') {
      return `Set ${liveData.currentSet || 1}`;
    }
    return null;
  }, [hasLiveData, liveData, match.sport.slug]);

  // Calculate result indicator for finished matches when teamId is provided
  const resultIndicator = useMemo(() => {
    if (!teamId || !match.status.isFinished || !displayScore) return null;
    
    const isHomeTeam = match.home.id === teamId;
    const isAwayTeam = match.away.id === teamId;
    
    if (!isHomeTeam && !isAwayTeam) return null;
    
    const teamScore = isHomeTeam ? displayScore.home : displayScore.away;
    const opponentScore = isHomeTeam ? displayScore.away : displayScore.home;
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  }, [teamId, match.status.isFinished, displayScore, match.home.id, match.away.id]);

  // Result indicator colors
  const resultColors = {
    win: 'bg-emerald-500',
    draw: 'bg-amber-500',
    loss: 'bg-red-500',
  };
  
  return (
    <div 
      className={`bg-background border-b border-border/50 hover:bg-muted/20 transition-colors duration-200 cursor-pointer relative ${
        isMobile ? 'p-2' : 'p-4'
      } ${resultIndicator ? 'pl-1' : ''}`}
      onClick={onClick}
    >
      {/* Result indicator bar */}
      {resultIndicator && (
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${resultColors[resultIndicator]}`}
        />
      )}
      {/* Header: Sport + League + Stage/Round + Status */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-2">
          <SportIcon className={`text-muted-foreground ${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          {/* League logo */}
          {match.league.logo && (
            <img 
              src={match.league.logo}
              alt=""
              className={`object-contain rounded-sm ${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
            />
          )}
          {match.league.name && (
            <span className={`text-muted-foreground font-medium truncate ${isMobile ? 'text-xs max-w-[120px]' : 'text-sm'}`}>
              {match.league.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Stage / Round */}
          {(match.stage || match.round) && (
            <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {match.stage}
              {match.stage && match.round && ' • '}
              {match.round}
            </span>
          )}
          
          {/* Status Badge with game time for live matches */}
          {match.status.isLive && (
            <div className="flex items-center gap-1.5">
              {gameTimeDisplay && (
                <span className="text-xs font-medium text-emerald-500">
                  {gameTimeDisplay}
                </span>
              )}
              <Badge variant="destructive" className="text-xs animate-pulse">
                Live
              </Badge>
            </div>
          )}
          {match.status.isFinished && (
            <Badge variant="secondary" className="text-xs">
              FT
            </Badge>
          )}
        </div>
      </div>

      {/* Date/Time - only show for upcoming matches */}
      {!match.status.isLive && (
        <div className={isMobile ? 'mb-2' : 'mb-3'}>
          <DateTimeDisplay 
            startingAt={match.startIso} 
            viewMode="grid"
          />
        </div>
      )}

      {/* Teams with scores - vertical layout like FinishedMatchCard */}
      <div className={`space-y-2 ${isMobile ? 'mb-2' : 'mb-4'}`}>
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!hideImages && teamA.image && (
              <img 
                src={teamA.image} 
                alt={teamA.name} 
                className="w-6 h-6 object-contain"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{teamA.name}</span>
              {/* Basketball quarter breakdown for home team */}
              {isBasketball && hasScore && displayScore?.breakdown && displayScore.breakdown.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {displayScore.breakdown.map((period, idx) => (
                    <span key={idx}>{period.label}: {period.home}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {hasScore && displayScore && (
            <span className={`text-lg font-bold tabular-nums ${displayScore.home > displayScore.away ? 'text-foreground' : 'text-muted-foreground'}`}>
              {displayScore.home}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!hideImages && teamB.image && (
              <img 
                src={teamB.image} 
                alt={teamB.name} 
                className="w-6 h-6 object-contain"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{teamB.name}</span>
              {/* Basketball quarter breakdown for away team */}
              {isBasketball && hasScore && displayScore?.breakdown && displayScore.breakdown.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {displayScore.breakdown.map((period, idx) => (
                    <span key={idx}>{period.label}: {period.away}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {hasScore && displayScore && (
            <span className={`text-lg font-bold tabular-nums ${displayScore.away > displayScore.home ? 'text-foreground' : 'text-muted-foreground'}`}>
              {displayScore.away}
            </span>
          )}
        </div>
      </div>

      {/* Score breakdown for non-basketball sports - desktop only */}
      {!isMobile && !isBasketball && hasScore && displayScore?.breakdown && displayScore.breakdown.length > 0 && (
        <div className="mb-4 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {displayScore.breakdown.map((period, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="font-medium">{period.label}:</span>
                <span>{period.home}-{period.away}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Odds */}
      <div className={isMobile ? 'mb-2' : 'mb-4'}>
        <StyledOddsDisplay 
          gameId={match.gameId}
          participants={participants}
          sport={{ name: match.sport.name, slug: match.sport.slug }}
          league={{ name: match.league.name, slug: match.league.slug, logo: match.league.logo }}
          startsAt={match.startIso}
        />
      </div>

      {/* Reaction Bar */}
      <ReactionBar
        likes={reactions?.likes || 0}
        comments={reactions?.comments || 0}
        userLiked={reactions?.userLiked || false}
        postId={match.stgId || match.id}
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

interface CompactVariantProps extends VariantProps {
  parsedScore?: { home: number; away: number };
  showOdds: boolean;
}

function CompactVariant({
  match,
  onClick,
  SportIcon,
  hideImages,
  teamA,
  teamB,
  parsedScore,
  participants,
  showOdds,
}: CompactVariantProps) {
  // Get live data for real-time updates
  const liveData = useLiveMatchData(match);
  const hasLiveData = match.status.isLive && liveData.isAvailable;
  
  // Determine score to display - prefer live data when available
  const displayScore = useMemo(() => {
    if (hasLiveData) {
      if (match.sport.slug === 'soccer' || match.sport.slug === 'football') {
        return {
          home: liveData.soccerGoals?.home ?? 0,
          away: liveData.soccerGoals?.away ?? 0
        };
      }
      if (match.sport.slug === 'basketball') {
        return {
          home: liveData.basketballTotal?.home ?? 0,
          away: liveData.basketballTotal?.away ?? 0
        };
      }
      if (match.sport.slug === 'tennis' || match.sport.slug === 'volleyball') {
        return {
          home: liveData.setsWon?.home ?? 0,
          away: liveData.setsWon?.away ?? 0
        };
      }
    }
    return parsedScore;
  }, [hasLiveData, liveData, match.sport.slug, parsedScore]);

  // Game time display for live matches
  const gameTimeDisplay = useMemo(() => {
    if (!hasLiveData) return null;
    
    if (match.sport.slug === 'soccer' || match.sport.slug === 'football') {
      const time = liveData.gameTime;
      if (time) return time.match(/^\d+$/) ? `${time}'` : time;
    }
    if (match.sport.slug === 'basketball') {
      const state = liveData.gameState;
      const stateMap: Record<string, string> = {
        'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4',
        'H1': '1H', 'H2': '2H', 'HT': 'HT', 'OT': 'OT'
      };
      return stateMap[state || ''] || state || '';
    }
    if (match.sport.slug === 'tennis') {
      return `Set ${liveData.currentSet || 1}`;
    }
    return null;
  }, [hasLiveData, liveData, match.sport.slug]);

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
        
        {/* Live indicator with game time or date/time */}
        {match.status.isLive ? (
          <div className="flex items-center gap-1.5">
            {gameTimeDisplay && (
              <span className="text-[10px] font-medium text-emerald-500">
                {gameTimeDisplay}
              </span>
            )}
            <LiveMatchIndicator isLive={true} viewMode="list" />
          </div>
        ) : (
          <DateTimeDisplay startingAt={match.startIso} viewMode="list" />
        )}
      </div>

      {/* Teams with live scores */}
      <div className="mb-2">
        <TeamDisplay 
          teamA={teamA}
          teamB={teamB}
          viewMode="list"
          score={match.status.isLive || match.status.isFinished ? displayScore : undefined}
          hideImages={hideImages}
        />
      </div>
      
      {/* Odds */}
      {showOdds && match.hasAzuroId && (
        <StyledOddsDisplay 
          gameId={match.gameId}
          participants={participants}
          sport={{ name: match.sport.name, slug: match.sport.slug }}
          league={{ name: match.league.name, slug: match.league.slug, logo: match.league.logo }}
          startsAt={match.startIso}
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
}: VariantProps) {
  // Get live data for real-time updates
  const liveData = useLiveMatchData(match);
  const hasLiveData = match.status.isLive && liveData.isAvailable;
  
  // Determine score to display - prefer live data when available
  const displayScore = useMemo(() => {
    if (hasLiveData) {
      if (match.sport.slug === 'soccer' || match.sport.slug === 'football') {
        return {
          home: liveData.soccerGoals?.home ?? 0,
          away: liveData.soccerGoals?.away ?? 0
        };
      }
      if (match.sport.slug === 'basketball') {
        return {
          home: liveData.basketballTotal?.home ?? 0,
          away: liveData.basketballTotal?.away ?? 0
        };
      }
      if (match.sport.slug === 'tennis' || match.sport.slug === 'volleyball') {
        return {
          home: liveData.setsWon?.home ?? 0,
          away: liveData.setsWon?.away ?? 0
        };
      }
    }
    return undefined;
  }, [hasLiveData, liveData, match.sport.slug]);

  // Game time display for live matches
  const gameTimeDisplay = useMemo(() => {
    if (!hasLiveData) return null;
    
    if (match.sport.slug === 'soccer' || match.sport.slug === 'football') {
      const time = liveData.gameTime;
      if (time) return time.match(/^\d+$/) ? `${time}'` : time;
    }
    if (match.sport.slug === 'basketball') {
      const state = liveData.gameState;
      const stateMap: Record<string, string> = {
        'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4',
        'H1': '1H', 'H2': '2H', 'HT': 'HT', 'OT': 'OT'
      };
      return stateMap[state || ''] || state || '';
    }
    if (match.sport.slug === 'tennis') {
      return `Set ${liveData.currentSet || 1}`;
    }
    return null;
  }, [hasLiveData, liveData, match.sport.slug]);

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
        
        {/* Show live indicator with game time or regular status */}
        {match.status.isLive ? (
          <div className="flex items-center gap-1.5">
            {gameTimeDisplay && (
              <span className="text-xs font-medium text-emerald-500">
                {gameTimeDisplay}
              </span>
            )}
            <Badge variant="destructive" className="text-xs animate-pulse">
              Live
            </Badge>
          </div>
        ) : (
          <MatchStatusBadge statusLong={match.status.statusLong} />
        )}
      </div>

      {/* Date/Time - only for non-live matches */}
      {!match.status.isLive && (
        <div className="mb-3">
          <DateTimeDisplay 
            startingAt={match.startIso} 
            viewMode="grid"
          />
        </div>
      )}

      {/* Teams with live scores */}
      <div className="mb-4">
        <TeamDisplay 
          teamA={teamA}
          teamB={teamB}
          viewMode="grid"
          score={displayScore}
          hideImages={hideImages}
        />
      </div>

      {/* Odds */}
      {match.hasAzuroId ? (
        <StyledOddsDisplay 
          gameId={match.gameId}
          participants={participants}
          sport={{ name: match.sport.name, slug: match.sport.slug }}
          league={{ name: match.league.name, slug: match.league.slug, logo: match.league.logo }}
          startsAt={match.startIso}
        />
      ) : (
        <div className="text-center py-2 text-xs text-muted-foreground">
          Odds not available
        </div>
      )}
    </div>
  );
}
