import { useMemo } from 'react';
import { TeamDisplay } from "@/features/sports/components/MatchCard/components/TeamDisplay";
import { DateTimeDisplay } from "@/features/sports/components/MatchCard/components/DateTimeDisplay";
import { StyledOddsDisplay } from "@/features/social-feed/components/shared/StyledOddsDisplay";
import { MatchStatusBadge } from "@/features/sports/components/MatchCard/components/MatchStatusBadge";
import { ScoreDisplay } from "@/features/sports/components/MatchCard/components/ScoreDisplay";
import { Badge } from "@/components/ui/badge";
import { getSportById } from "@/lib/sportsMapping";
import { isMatchFinished } from "@/features/match-details/utils/matchState";
import { parseStatesScore } from "@/features/sports/utils/payloadParser";
import { useLiveStats } from "@/features/sports/hooks/useLiveStats";

interface MatchCardProps {
  match: any;
  onClick?: () => void;
}

export function LeagueMatchCard({ match, onClick }: MatchCardProps) {
  const sport = match.sport as { id?: string; slug?: string } | undefined;
  const sportInfo = getSportById(sport?.id || sport?.slug);
  const hideImages = sportInfo.slug === 'tennis' || sportInfo.slug === 'volleyball';
  
  const teamA = match.participants?.[0];
  const teamB = match.participants?.[1];
  const hasAzuroId = !!match.azuro_game_id;
  
  // Check if match is finished (!is_live && !is_prematch)
  const isFinished = isMatchFinished(match);
  const isLive = match.is_live === true || match.state === 'Live';
  const parsedScore = isFinished && match.states ? parseStatesScore(match.states, sportInfo.slug) : null;

  // Get live data for real-time updates
  const gameData = useMemo(() => ({
    gameId: match.gameId || match.azuro_game_id,
    sport: { sportId: sport?.id, slug: sportInfo.slug },
    state: isLive ? 'Live' : undefined
  }), [match.gameId, match.azuro_game_id, sport?.id, sportInfo.slug, isLive]);

  const liveData = useLiveStats(gameData, sportInfo.slug);
  const hasLiveData = isLive && liveData.isAvailable;

  // Compute live score based on sport
  const liveScore = useMemo(() => {
    if (!hasLiveData) return null;
    
    if (sportInfo.slug === 'soccer' || sportInfo.slug === 'football') {
      return {
        home: liveData.soccerGoals?.home ?? 0,
        away: liveData.soccerGoals?.away ?? 0
      };
    }
    if (sportInfo.slug === 'basketball') {
      return {
        home: liveData.basketballTotal?.home ?? 0,
        away: liveData.basketballTotal?.away ?? 0
      };
    }
    if (sportInfo.slug === 'tennis' || sportInfo.slug === 'volleyball') {
      return {
        home: liveData.setsWon?.home ?? 0,
        away: liveData.setsWon?.away ?? 0
      };
    }
    return null;
  }, [hasLiveData, liveData, sportInfo.slug]);

  // Game time display for live matches
  const gameTimeDisplay = useMemo(() => {
    if (!hasLiveData) return null;
    
    if (sportInfo.slug === 'soccer' || sportInfo.slug === 'football') {
      const time = liveData.gameTime;
      if (time) return time.match(/^\d+$/) ? `${time}'` : time;
    }
    if (sportInfo.slug === 'basketball') {
      const state = liveData.gameState;
      const stateMap: Record<string, string> = {
        'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4',
        'H1': '1H', 'H2': '2H', 'HT': 'HT', 'OT': 'OT'
      };
      return stateMap[state || ''] || state || '';
    }
    if (sportInfo.slug === 'tennis') {
      return `Set ${liveData.currentSet || 1}`;
    }
    return null;
  }, [hasLiveData, liveData, sportInfo.slug]);

  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header : Sport + League + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {sportInfo.icon && (
            <sportInfo.icon className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground font-medium">
            {(match.league as { name?: string })?.name}
          </span>
        </div>
        
        {/* Live indicator with game time or regular status badge */}
        {isLive ? (
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
          <MatchStatusBadge statusLong={match.status_long} />
        )}
      </div>

      {/* Date/Time - only for non-live matches */}
      {!isLive && (
        <div className="mb-3">
          <DateTimeDisplay 
            startingAt={match.startsAt as string | number} 
            viewMode="grid"
          />
        </div>
      )}

      {/* Teams or Score Display */}
      <div className="mb-4">
        {isFinished && parsedScore ? (
          <ScoreDisplay
            score={parsedScore}
            teamAName={teamA?.name || 'Team A'}
            teamBName={teamB?.name || 'Team B'}
            isFinished={true}
            viewMode="grid"
          />
        ) : (
          <TeamDisplay 
            teamA={teamA}
            teamB={teamB}
            viewMode="grid"
            hideImages={hideImages}
            score={liveScore || undefined}
          />
        )}
      </div>

      {/* Odds (only for non-finished matches with azuro_game_id) */}
      {!isFinished && hasAzuroId && (
        <div>
          <StyledOddsDisplay 
            gameId={match.azuro_game_id!}
            participants={[teamA, teamB].filter(Boolean)}
            sport={{ name: sportInfo.name, slug: sportInfo.slug }}
            league={typeof match.league === 'object' ? { name: (match.league as any).name || '', slug: (match.league as any).slug || '', logo: (match.league as any).logo } : undefined}
            startsAt={match.startsAt as string}
          />
        </div>
      )}

      {/* Message if no odds available (only for non-finished matches) */}
      {!isFinished && !hasAzuroId && (
        <div className="text-center py-2 text-xs text-muted-foreground">
          Odds not available
        </div>
      )}
    </div>
  );
}
