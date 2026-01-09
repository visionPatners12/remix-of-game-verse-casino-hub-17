/**
 * @deprecated This page is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Zap, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarFallback as ThemeAvatarFallback } from '@/components/ui/avatar-fallback';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateTimeDisplay } from '@/features/sports/components/MatchCard/components/DateTimeDisplay';
import { useGame, useActiveMarkets } from '@azuro-org/sdk';
import { getConditionStateInfo, isConditionActive } from '@/utils/conditionHelpers';
import { ConditionState } from '@/types';
import type { Market, MarketOutcome } from '@azuro-org/toolkit';
import type { PredictionSelection } from '@/types';
import { OddsButton } from '@/shared/ui/buttons';
import type { TeamType } from '@/shared/ui/buttons/types';

export default function SelectOddsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');
  const sportSlug = searchParams.get('sport');
  const leagueSlug = searchParams.get('league');

  const sportName = sessionStorage.getItem('selectedSportName') || '';
  const leagueName = sessionStorage.getItem('selectedLeagueName') || '';

  const { data: match = null, isLoading: gameLoading } = useGame({
    gameId: matchId || '',
    chainId: 137,
    query: { enabled: !!matchId },
  });

  const { data: markets = [], isFetching: marketsLoading, refetch: refetchMarkets } = useActiveMarkets({
    gameId: matchId || '',
    chainId: 137,
    query: { enabled: !!matchId && !!match },
  });

  const isLoading = gameLoading || marketsLoading;

  useEffect(() => {
    if (!matchId || !sportSlug || !leagueSlug) {
      navigate('/create-post/select-sport');
    }
  }, [matchId, sportSlug, leagueSlug, navigate]);

  const handleOddsSelection = (outcome: MarketOutcome, market: Market) => {
    if (!match) return;

    const selection: PredictionSelection = {
      matchId: matchId || '',
      selectedOutcome: outcome,
      market,
      prediction: {
        matchTitle: `${match.participants[0]?.name} vs ${match.participants[1]?.name}`,
        predictionText: outcome.selectionName,
        odds: outcome.odds,
        sport: sportName,
        league: leagueName,
      },
      gameId: outcome.gameId,
      conditionId: outcome.conditionId,
      outcomeId: outcome.outcomeId,
      startsAt: match.startsAt,
      participants: match.participants,
    };

    sessionStorage.setItem('selectedPrediction', JSON.stringify(selection));
    navigate('/create-post');
  };

  // Helper to determine team type for styling
  const getTeamType = (index: number, totalOutcomes: number): TeamType => {
    if (totalOutcomes === 2) {
      return index === 0 ? 'home' : 'away';
    }
    if (totalOutcomes === 3) {
      return index === 0 ? 'home' : index === 1 ? 'draw' : 'away';
    }
    return 'draw';
  };

  return (
    <Layout hideNavigation={true}>
      <div style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/create-post/select-match?sport=${sportSlug}&league=${leagueSlug}`)}
              className="p-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-base font-semibold">Choisir une cote</h1>
              <p className="text-xs text-muted-foreground">{leagueName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchMarkets()}
            className="p-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto">
          {isLoading || !match ? (
            <div className="p-3 space-y-3">
              <div className="h-16 bg-muted rounded-lg"></div>
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>
          ) : (
            <>
              {/* Match Info */}
              <div className="bg-card border-b p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={match.participants[0]?.image} />
                      <AvatarFallback asChild>
                        <ThemeAvatarFallback name={match.participants[0]?.name || 'Team'} variant="team" size="sm" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {match.participants[0]?.name} <span className="text-muted-foreground font-normal">vs</span> {match.participants[1]?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {leagueName}
                      </div>
                    </div>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={match.participants[1]?.image} />
                      <AvatarFallback asChild>
                        <ThemeAvatarFallback name={match.participants[1]?.name || 'Team'} variant="team" size="sm" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {match.startsAt && (
                    <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                      <DateTimeDisplay startingAt={match.startsAt} viewMode="list" />
                    </div>
                  )}
                </div>
              </div>

              {/* Markets */}
              {markets.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold mb-2">Aucune cote disponible</h3>
                  <p className="text-sm text-muted-foreground">
                    Les cotes ne sont pas encore disponibles
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {markets.map((market) => {
                    const firstActiveCondition = market.conditions?.find(condition =>
                      isConditionActive(condition.state as ConditionState)
                    ) ?? market.conditions?.[0];

                    if (!firstActiveCondition?.outcomes?.length) return null;

                    const isActive = isConditionActive(firstActiveCondition.state as ConditionState);
                    const outcomes = firstActiveCondition.outcomes;

                    return (
                      <div key={market.marketKey} className="space-y-2">
                        <h4 className="font-semibold text-sm px-1">{market.name}</h4>

                        <div className="flex gap-2">
                          {outcomes.map((outcome, index) => (
                            <div key={`${outcome.conditionId}-${outcome.outcomeId}`} className="flex-1">
                              <OddsButton
                                variant="sport"
                                odds={outcome.odds || 1.01}
                                label={outcome.selectionName}
                                outcome={outcome}
                                teamType={getTeamType(index, outcomes.length)}
                                disabled={!isActive}
                                onSelect={() => handleOddsSelection(outcome, market)}
                                gameId={match?.gameId || ''}
                                eventName={`${match?.participants[0]?.name} vs ${match?.participants[1]?.name}`}
                                marketType={market.name}
                                participants={match?.participants || []}
                                realTimeOdds={false}
                                className="w-full"
                                sport={{ name: sportName, slug: sportSlug || '' }}
                                league={{ name: leagueName, slug: leagueSlug || '' }}
                                startsAt={match?.startsAt}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      </div>
    </Layout>
  );
}
