import React, { useState, memo, useMemo } from "react";
import { Tabs, TabsContent } from "@/ui";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBaseBetslip } from '@azuro-org/sdk';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { GameMarkets } from '@azuro-org/toolkit';
import { isMatchFinished } from '../utils/matchState';
import { useMatchData } from '../hooks/useMatchData';
import { MatchHeader } from "./MatchHeader";
import { MatchInfoBar } from "./MatchInfoBar";
import { MatchReactionSection } from "./MatchReactionSection";
import { MarketsSection } from "./MarketsSection";
import { MatchEventsSection } from "./MatchEventsSection";
import { MatchStatsSection } from "./MatchStatsSection";
import { MatchLineupSection } from "./MatchLineupSection";
import { MatchBoxScoreSection } from "./MatchBoxScoreSection";
import { H2HSection } from "./H2HSection";
import { AFBoxScoreSection } from "./AFBoxScoreSection";
import { AFStatsSection } from "./AFStatsSection";
import { InjuriesSection } from "./InjuriesSection";
import { TopPerformersSection } from "./TopPerformersSection";
import { AFEventCard } from "./AFEventCard";
import { CricketScorecard } from "./CricketScorecard";
import { CricketTopPerformers } from "./CricketTopPerformers";
import { CricketSquad } from "./CricketSquad";
import { RugbyLineupsSection } from "./RugbyLineupsSection";
import { RugbyBoxScoreSection } from "./RugbyBoxScoreSection";
import { BaseballLineupsSection } from "./BaseballLineupsSection";
import { BaseballBoxScoreSection } from "./BaseballBoxScoreSection";
import { BasketballStatsSection } from "./BasketballStatsSection";
import { BasketballBoxScoreSection } from "./BasketballBoxScoreSection";
import { BasketballLineupsSection } from "./BasketballLineupsSection";
import { BaseballStatsSection } from "./BaseballStatsSection";
import { BaseballEventCard } from "./BaseballEventCard";
import { AFLineupsSection } from "./AFLineupsSection";
import { AzuroBasketballStatsSection } from "./AzuroBasketballStatsSection";
import { HockeyStatsSection } from "./HockeyStatsSection";
import { HockeyLineupsSection } from "./HockeyLineupsSection";
import { HockeyBoxScoreSection } from "./HockeyBoxScoreSection";
import { HockeyScoreDisplay } from "./HockeyScoreDisplay";
import { VolleyballScoreDisplay } from "./VolleyballScoreDisplay";
import { useMatchLineup } from "../hooks/useMatchLineup";
import { MatchDetailsTabs, getMatchDetailsTabs } from "./MatchDetailsTabs";


// NHL tier leagues for rich data support
const NHL_TIER_LEAGUES = ['nhl', 'ncaa', 'ncaa-hockey', 'ahl'];

interface MatchDetailsContentProps {
  match: SupabaseMatchData;
  markets: GameMarkets;
}


export const MatchDetailsContent = memo(function MatchDetailsContent({ match, markets }: MatchDetailsContentProps) {
  const isMobile = useIsMobile();
  
  // Check if match_id is available (required for Highlightly data)
  const hasMatchId = !!match.match_id;
  
  // Only fetch Highlightly data if match_id is available
  const { data: matchData, isLoading: isMatchDataLoading } = useMatchData(hasMatchId ? match.id : undefined);
  
  // Check if match is finished based on is_prematch and is_live flags
  const isFinished = isMatchFinished(match);
  
  // Detect sport type
  const isAmericanFootball = useMemo(() => 
    match.sport?.slug === 'american-football', [match.sport?.slug]
  );
  const isCricket = useMemo(() => 
    match.sport?.slug === 'cricket', [match.sport?.slug]
  );
  const isRugby = useMemo(() => 
    match.sport?.slug === 'rugby', [match.sport?.slug]
  );
  const isBaseball = useMemo(() => 
    match.sport?.slug === 'baseball', [match.sport?.slug]
  );
  const isBasketball = useMemo(() => 
    match.sport?.slug === 'basketball', [match.sport?.slug]
  );
  const isHockey = useMemo(() => 
    match.sport?.slug === 'ice-hockey' || match.sport?.slug === 'hockey', [match.sport?.slug]
  );
  const isFootball = useMemo(() => 
    match.sport?.slug === 'football', [match.sport?.slug]
  );
  const isVolleyball = useMemo(() => 
    match.sport?.slug === 'volleyball', [match.sport?.slug]
  );
  
  // Check if hockey match is NHL/NCAA tier (has rich data)
  const isNHLTierHockey = useMemo(() => {
    if (!isHockey) return false;
    const leagueSlug = (match.league_info?.slug || match.league_azuro_slug || '').toLowerCase();
    return NHL_TIER_LEAGUES.some(tier => leagueSlug.includes(tier));
  }, [isHockey, match.league_info?.slug, match.league_azuro_slug]);
  
  // Check if basketball match is NBA (only NBA has lineup endpoint)
  const isNBABasketball = useMemo(() => {
    if (!isBasketball) return false;
    const leagueSlug = (match.league_info?.slug || match.league_azuro_slug || '').toLowerCase();
    return leagueSlug.includes('nba');
  }, [isBasketball, match.league_info?.slug, match.league_azuro_slug]);
  
  // For football prematch, hide Feed/Stats/Lineup as they have no data yet
  const isPrematchFootball = isFootball && match.is_prematch;
  
  // Only fetch lineup data if match_id is available and for supported sports
  // Basketball: only NBA has lineup endpoint
  const { data: lineupData, isLoading: isLineupLoading } = useMatchLineup(
    hasMatchId && (isBaseball || isAmericanFootball || isNBABasketball || isNHLTierHockey) ? match.id : undefined
  );
  
  // Cricket uses Stats tab (scorecard) instead of BoxScore
  // Generic hockey and volleyball show BoxScore even without match_id (scores from states)
  const showBoxScore = (hasMatchId && isFinished && !isCricket) || ((isHockey && !isNHLTierHockey || isVolleyball) && isFinished);
  
  // Set default tab based on match state, sport, and data availability
  const getDefaultTab = () => {
    // Without match_id, only Markets and Live (for basketball) are available
    if (!hasMatchId) {
      return isBasketball && match.is_live ? "azuro-stats" : "markets";
    }
    if (isFinished) {
      return isCricket ? "stats" : "boxscore";
    }
    return "markets";
  };
  const [activeTab, setActiveTab] = useState(getDefaultTab);
  
  const baseBetslip = useBaseBetslip();

  // Get tabs configuration
  const tabs = useMemo(() => getMatchDetailsTabs({
    hasMatchId,
    showBoxScore,
    isFinished,
    isCricket,
    isBasketball,
    isNBABasketball,
    isPrematchFootball,
    isAmericanFootball,
    isBaseball,
    isHockey,
    isNHLTierHockey,
    isVolleyball,
    isRugby,
    isLive: match.is_live,
    hasAzuroGameId: !!match.azuro_game_id,
    isPrematch: match.is_prematch
  }), [hasMatchId, showBoxScore, isFinished, isCricket, isBasketball, isNBABasketball, isPrematchFootball, isAmericanFootball, isBaseball, isHockey, isNHLTierHockey, isVolleyball, isRugby, match.is_live, match.azuro_game_id, match.is_prematch]);

  return (
    <>
      <div className="pb-24">
        {/* Sticky Header Section - includes header + tabs */}
        <div className="sticky top-0 z-20 bg-background">
          <MatchHeader match={match} />
          <MatchInfoBar 
            venue={matchData?.venue}
            referee={matchData?.referee}
            forecast={matchData?.forecast}
          />
          <H2HSection 
            homeTeamId={matchData?.homeTeamId || match.home_team?.id}
            awayTeamId={matchData?.awayTeamId || match.away_team?.id}
            homeTeamName={match.home_team?.name || match.home}
            awayTeamName={match.away_team?.name || match.away}
            sportSlug={match.sport?.slug}
            leagueSlug={match.league_info?.slug || match.league_azuro_slug}
          />
          
          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative">
            <MatchDetailsTabs tabs={tabs} isMobile={isMobile} />
          </Tabs>
        </div>

      {/* Tab Content - scrollable */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* Box Score content - only when finished (not for Cricket) */}
        {showBoxScore && (
          <TabsContent value="boxscore" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              {isAmericanFootball ? (
                <AFBoxScoreSection match={match} matchData={matchData} isLoading={isMatchDataLoading} />
              ) : isBaseball ? (
                <BaseballBoxScoreSection match={match} matchData={matchData} isLoading={isMatchDataLoading} />
              ) : isBasketball ? (
                <BasketballBoxScoreSection match={match} matchData={matchData} isLoading={isMatchDataLoading} />
              ) : isHockey ? (
                isNHLTierHockey ? (
                  <HockeyBoxScoreSection match={match} />
                ) : (
                  <HockeyScoreDisplay match={match} matchData={matchData} isLoading={isMatchDataLoading} />
                )
              ) : isVolleyball ? (
                <VolleyballScoreDisplay match={match} matchData={matchData} isLoading={isMatchDataLoading} />
              ) : isRugby ? (
                <RugbyBoxScoreSection match={match} matchData={matchData} isLoading={isMatchDataLoading} />
              ) : (
                <MatchBoxScoreSection match={match} />
              )}
            </div>
          </TabsContent>
        )}

        {/* Markets content - only when NOT finished - Azuro data */}
        {!isFinished && (
          <TabsContent value="markets" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              <MarketsSection 
                match={match}
                markets={markets}
                isPredictionMode={false} 
                baseBetslip={baseBetslip}
              />
            </div>
          </TabsContent>
        )}

        {/* Match Events hidden for Cricket, Basketball, Volleyball, Football prematch, and non-NHL hockey - requires match_id */}
        {hasMatchId && !isCricket && !isBasketball && !isVolleyball && !isPrematchFootball && !(isHockey && !isNHLTierHockey) && (
          <TabsContent value="events" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              <MatchEventsSection matchId={match.id} sportSlug={match.sport?.slug} />
            </div>
          </TabsContent>
        )}

        {/* Stats - requires match_id, hidden for football prematch, volleyball and non-NHL hockey */}
        {hasMatchId && !isPrematchFootball && !isVolleyball && !(isHockey && !isNHLTierHockey) && (
          <TabsContent value="stats" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
            {isCricket ? (
                <CricketScorecard 
                  statistics={matchData?.statistics as any}
                  states={matchData?.states as { description?: string; report?: string }}
                  isLoading={isMatchDataLoading} 
                />
              ) : isAmericanFootball ? (
                <AFStatsSection match={match} matchData={matchData} isLoading={isMatchDataLoading} />
              ) : isBasketball ? (
                <BasketballStatsSection match={match} />
              ) : isBaseball ? (
                <BaseballStatsSection match={match} />
              ) : isHockey ? (
                <HockeyStatsSection match={match} />
              ) : (
                <MatchStatsSection match={match} />
              )}
            </div>
          </TabsContent>
        )}

        {/* Lineup - for football-like sports, Rugby, NHL tier Hockey, and NBA Basketball - requires match_id */}
        {hasMatchId && !isAmericanFootball && !isCricket && !isBaseball && !(isBasketball && !isNBABasketball) && !isVolleyball && !isPrematchFootball && !(isHockey && !isNHLTierHockey) && (
          <TabsContent value="lineup" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              {isNBABasketball ? (
                <BasketballLineupsSection lineupData={lineupData} isLoading={isLineupLoading} />
              ) : isRugby ? (
                <RugbyLineupsSection boxScores={matchData?.boxScores} isLoading={isMatchDataLoading} />
              ) : isHockey ? (
                <HockeyLineupsSection lineupData={lineupData} isLoading={isLineupLoading} />
              ) : (
                <MatchLineupSection match={match} />
              )}
            </div>
          </TabsContent>
        )}

        {/* Roster - for Baseball and American Football - requires match_id */}
        {hasMatchId && (isBaseball || isAmericanFootball) && (
          <TabsContent value="roster" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              {isBaseball ? (
                <BaseballLineupsSection lineupData={lineupData} isLoading={isLineupLoading} />
              ) : (
                <AFLineupsSection lineupData={lineupData} isLoading={isLineupLoading} />
              )}
            </div>
          </TabsContent>
        )}

        {/* Squad - only for Cricket - requires match_id */}
        {hasMatchId && isCricket && (
          <TabsContent value="squad" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              <CricketSquad squad={matchData?.boxScores} isLoading={isMatchDataLoading} />
            </div>
          </TabsContent>
        )}

        {/* Performers - Cricket - requires match_id */}
        {hasMatchId && isCricket && (
          <TabsContent value="performers" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              <CricketTopPerformers topPerformers={matchData?.topPerformers} isLoading={isMatchDataLoading} />
            </div>
          </TabsContent>
        )}

        {/* Injuries - only for AF - requires match_id */}
        {hasMatchId && isAmericanFootball && (
          <TabsContent value="injuries" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              <InjuriesSection match={match} matchData={matchData} isLoading={isMatchDataLoading} />
            </div>
          </TabsContent>
        )}

        {/* Azuro Stats - for live basketball - Azuro data, no match_id needed */}
        {isBasketball && match.is_live && (
          <TabsContent value="azuro-stats" className="mt-0">
            <div className={isMobile ? 'px-2 py-4' : 'max-w-7xl mx-auto px-4 py-6'}>
              <AzuroBasketballStatsSection match={match} />
            </div>
          </TabsContent>
        )}

      </Tabs>
      </div>
      
      {/* Fixed reaction bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/40 pb-[var(--safe-area-inset-bottom)]">
        <MatchReactionSection matchId={match.id} />
      </div>
    </>
  );
});