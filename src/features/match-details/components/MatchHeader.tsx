import React, { memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import { useLeagueNavigation } from "@/features/profile/league/hooks/useLeagueNavigation";
import { TeamButton, TeamData } from "./TeamButton";
import { useLiveStats } from "@/features/sports/hooks/useLiveStats";
import { getSportById } from "@/lib/sportsMapping";
import { parseStatesScore } from "@/features/sports/utils/payloadParser";
import { getStatusLongInfo } from "@/features/sports/utils/statusLongMapper";
import { buildTeamUrl } from "@/utils/seoUrls";

interface MatchHeaderProps {
  match: SupabaseMatchData;
}

export const MatchHeader = memo(function MatchHeader({ match }: MatchHeaderProps) {
  const navigate = useNavigate();
  const { navigateToLeague } = useLeagueNavigation();
  
  // Get team names and logos directly from match data
  const teamAName = match.home;
  const teamBName = match.away;
  const initialsA = teamAName.substring(0, 2);
  const initialsB = teamBName.substring(0, 2);
  
  // Team navigation handler with full team data for SEO URLs
  const handleTeamClick = useCallback((team: TeamData | null) => {
    if (!team?.id) return;
    navigate(buildTeamUrl({
      id: team.id,
      slug: team.slug,
      name: team.name,
      sport_slug: match.sport?.slug,
      sport_name: match.sport?.name,
    }));
  }, [navigate, match.sport]);
  
  // League navigation
  const leagueName = match.league;
  const leagueLogo = match.league_info?.logo;
  
  const formattedDateTime = useMemo(() => {
    try {
      const date = new Date(match.start_iso);
      return {
        date: date.toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    } catch {
      return { date: 'Unknown date', time: '--:--' };
    }
  }, [match.start_iso]);

  const isLive = match.is_live;
  const isFinished = !match.is_prematch && !match.is_live;
  const sportSlug = match.sport?.slug;
  const sportInfo = getSportById(sportSlug || '', match.sport?.name);
  const SportIcon = sportInfo.icon;

  // Get status label and color
  const statusInfo = useMemo(() => {
    if (isLive) return { label: 'Live', color: 'text-red-500 bg-red-500/10' };
    if (isFinished) return { label: 'FT', color: 'text-muted-foreground bg-muted' };
    return null; // Upcoming matches don't need a badge (date/time shown)
  }, [isLive, isFinished]);

  // Normalize state to Azuro SDK format (capitalized)
  const normalizeGameState = (state: string | null | undefined): string => {
    const stateMap: Record<string, string> = {
      'live': 'Live',
      'prematch': 'Prematch',
      'resolved': 'Finished',
      'finished': 'Finished',
      'cancelled': 'Stopped',
      'canceled': 'Stopped',
      'stopped': 'Stopped'
    };
    const normalized = state?.toLowerCase() || '';
    return stateMap[normalized] || state || 'Prematch';
  };

  // Map match data for useLiveStats hook
  const gameForLiveStats = useMemo(() => {
    let derivedState: string;
    
    if (match.state) {
      // Normalize DB state (lowercase) to SDK format (capitalized)
      derivedState = normalizeGameState(match.state);
    } else {
      // Fallback to boolean flags
      if (match.is_live) {
        derivedState = 'Live';
      } else if (match.is_prematch) {
        derivedState = 'Prematch';
      } else {
        derivedState = 'Finished';
      }
    }
    
    console.log('[MatchHeader] gameForLiveStats:', {
      gameId: match.azuro_game_id,
      rawState: match.state,
      derivedState,
      isLive: match.is_live
    });
    
    return {
      gameId: match.azuro_game_id,
      sport: {
        sportId: match.sport?.id,
        slug: sportSlug
      },
      state: derivedState
    };
  }, [match.azuro_game_id, match.state, match.is_live, match.is_prematch, match.sport?.id, sportSlug]);

  const liveStats = useLiveStats(gameForLiveStats, sportSlug);

  // Parse score for finished matches
  const finishedScore = useMemo(() => {
    if (!isFinished || !match.matchStates) return null;
    return parseStatesScore(match.matchStates, sportSlug || '');
  }, [isFinished, match.matchStates, sportSlug]);

  // Fallback live score from matchStates when Azuro is unavailable
  const fallbackLiveScore = useMemo(() => {
    if (!isLive || !match.matchStates) return null;
    return parseStatesScore(match.matchStates, sportSlug || '');
  }, [isLive, match.matchStates, sportSlug]);

  // Get status display text for fallback
  const statusDisplay = useMemo(() => {
    if (!match.statusLong) return null;
    return getStatusLongInfo(match.statusLong).displayText;
  }, [match.statusLong]);

  return (
    <div className="w-full">
      {/* Safe area spacer for iOS notch */}
      <div style={{ height: 'var(--safe-area-inset-top)' }} className="bg-background" />
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm">
        <button
          onClick={() => navigate('/sports')}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 active:scale-95"
          aria-label="Back to sports"
        >
          <ArrowLeft className="h-5 w-5" />
          <SportIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{sportInfo.name}</span>
        </button>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          {leagueLogo && (
            <img 
              src={leagueLogo} 
              alt={leagueName}
              className="h-5 w-5 object-contain rounded"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          {match.league_info?.id ? (
            <button 
              onClick={() => navigateToLeague({
                id: match.league_info.id,
                slug: match.league_info.slug,
                name: match.league_info.name,
                country_name: match.country_name,
              })}
              className="hover:text-primary transition-colors duration-200 hover:underline cursor-pointer"
            >
              {leagueName}
            </button>
          ) : (
            <span>{leagueName}</span>
          )}
          {/* Stage / Round inline */}
          {(match.stage || match.round) && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">
                {match.stage}{match.stage && match.round && ' · '}{match.round && `R${match.round}`}
              </span>
            </>
          )}
          {statusInfo && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Match Header principal */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between w-full">
          {/* Team A */}
          <TeamButton
            team={match.home_team ? {
              id: match.home_team.id,
              name: match.home_team.name || teamAName,
              slug: match.home_team.slug,
              logo: match.home_team.logo,
            } : null}
            initials={initialsA}
            variant="home"
            onClick={handleTeamClick}
          />
        
          {/* VS Section */}
          <div className="flex flex-col items-center shrink-0 w-auto px-1">
            {isLive ? (
              <div className="flex flex-col items-center gap-1">
                {/* Football/Soccer */}
                {(sportSlug === 'soccer' || sportSlug === 'football') && (
                  liveStats.isAvailable ? (
                    <>
                      {liveStats.gameTime && (
                        <span className="text-[10px] text-red-500 font-semibold animate-pulse">{liveStats.gameTime}'</span>
                      )}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <span className="text-foreground">{liveStats.soccerGoals?.home ?? 0}</span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className="text-foreground">{liveStats.soccerGoals?.away ?? 0}</span>
                      </div>
                    </>
                  ) : fallbackLiveScore ? (
                    <>
                      {statusDisplay && (
                        <span className="text-[10px] text-red-500 font-semibold animate-pulse">{statusDisplay}</span>
                      )}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <span className="text-foreground">{fallbackLiveScore.home}</span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className="text-foreground">{fallbackLiveScore.away}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-red-500 animate-pulse">LIVE</span>
                  )
                )}

                {/* Basketball */}
                {sportSlug === 'basketball' && (
                  liveStats.isAvailable ? (
                    <>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        {liveStats.gameState && <span className="font-medium">{liveStats.gameState}</span>}
                        {liveStats.gameTime && <span>· {liveStats.gameTime}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <span className={`text-foreground ${liveStats.basketballPossession === 'home' ? 'underline decoration-primary decoration-2' : ''}`}>
                          {liveStats.basketballTotal?.home ?? 0}
                        </span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className={`text-foreground ${liveStats.basketballPossession === 'away' ? 'underline decoration-primary decoration-2' : ''}`}>
                          {liveStats.basketballTotal?.away ?? 0}
                        </span>
                      </div>
                      {liveStats.basketballQuarters && (
                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[9px] text-muted-foreground">
                          <span>Q1: {liveStats.basketballQuarters.q1.home}-{liveStats.basketballQuarters.q1.away}</span>
                          <span>Q2: {liveStats.basketballQuarters.q2.home}-{liveStats.basketballQuarters.q2.away}</span>
                          <span>Q3: {liveStats.basketballQuarters.q3.home}-{liveStats.basketballQuarters.q3.away}</span>
                          <span>Q4: {liveStats.basketballQuarters.q4.home}-{liveStats.basketballQuarters.q4.away}</span>
                        </div>
                      )}
                      {liveStats.gameState === 'OT' && liveStats.basketballOvertime && (liveStats.basketballOvertime.home > 0 || liveStats.basketballOvertime.away > 0) && (
                        <span className="text-[9px] text-amber-500 font-medium">
                          OT: {liveStats.basketballOvertime.home}-{liveStats.basketballOvertime.away}
                        </span>
                      )}
                    </>
                  ) : fallbackLiveScore ? (
                    <>
                      {statusDisplay && (
                        <span className="text-[10px] text-orange-500 font-semibold">{statusDisplay}</span>
                      )}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <span className="text-foreground">{fallbackLiveScore.home}</span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className="text-foreground">{fallbackLiveScore.away}</span>
                      </div>
                      {fallbackLiveScore.breakdown && (
                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[9px] text-muted-foreground">
                          {fallbackLiveScore.breakdown.map((q) => (
                            <span key={q.label}>{q.label}: {q.home}-{q.away}</span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-bold text-orange-500 animate-pulse">LIVE</span>
                  )
                )}

                {/* Tennis */}
                {sportSlug === 'tennis' && (
                  liveStats.isAvailable ? (
                    <div className="flex flex-col items-center gap-0.5">
                      {liveStats.currentSet && (
                        <span className="text-[10px] text-green-500 font-semibold">Set {liveStats.currentSet}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-5 h-4 bg-primary/20 text-[10px] font-bold rounded flex items-center justify-center">
                            {liveStats.setsWon.home}
                          </div>
                          <div className="w-5 h-4 bg-primary/20 text-[10px] font-bold rounded flex items-center justify-center">
                            {liveStats.setsWon.away}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="w-5 h-4 bg-muted text-[10px] font-bold rounded flex items-center justify-center">
                            {liveStats.currentSetScore.home}
                          </div>
                          <div className="w-5 h-4 bg-muted text-[10px] font-bold rounded flex items-center justify-center">
                            {liveStats.currentSetScore.away}
                          </div>
                        </div>
                        {liveStats.gamePoints && (
                          <div className="flex flex-col gap-0.5">
                            <div className="w-6 h-4 bg-accent text-[10px] font-bold rounded flex items-center justify-center">
                              {liveStats.gamePoints.home}
                            </div>
                            <div className="w-6 h-4 bg-accent text-[10px] font-bold rounded flex items-center justify-center">
                              {liveStats.gamePoints.away}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : fallbackLiveScore ? (
                    <>
                      {statusDisplay && (
                        <span className="text-[10px] text-green-500 font-semibold">{statusDisplay}</span>
                      )}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <span className="text-foreground">{fallbackLiveScore.home}</span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className="text-foreground">{fallbackLiveScore.away}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-green-500 animate-pulse">LIVE</span>
                  )
                )}

                {/* Generic fallback for other sports */}
                {!['soccer', 'football', 'basketball', 'tennis'].includes(sportSlug || '') && (
                  fallbackLiveScore ? (
                    <>
                      {statusDisplay && (
                        <span className="text-[10px] text-red-500 font-semibold animate-pulse">{statusDisplay}</span>
                      )}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <span className="text-foreground">{fallbackLiveScore.home}</span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span className="text-foreground">{fallbackLiveScore.away}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-red-500 animate-pulse">LIVE</span>
                  )
                )}
              </div>
            ) : isFinished ? (
              <div className="text-center">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Full Time
                </div>
                {finishedScore && (
                  <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <span className="text-foreground">{finishedScore.home}</span>
                    <span className="text-muted-foreground text-sm">-</span>
                    <span className="text-foreground">{finishedScore.away}</span>
                  </div>
                )}
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {formattedDateTime.date}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {formattedDateTime.date}
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                  {formattedDateTime.time}
                </div>
              </div>
            )}
          </div>

          {/* Team B */}
          <TeamButton
            team={match.away_team ? {
              id: match.away_team.id,
              name: match.away_team.name || teamBName,
              slug: match.away_team.slug,
              logo: match.away_team.logo,
            } : null}
            initials={initialsB}
            variant="away"
            onClick={handleTeamClick}
          />
        </div>
      </div>
    </div>
  );
});
