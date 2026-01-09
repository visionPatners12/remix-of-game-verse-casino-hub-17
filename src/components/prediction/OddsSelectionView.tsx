
import React, { useEffect, useState } from 'react';
import { Button, Badge, Avatar, AvatarImage, AvatarFallback } from '@/ui';
import { AvatarFallback as ThemeAvatarFallback } from '@/components/ui/avatar-fallback';
import { DateTimeDisplay } from '@/features/sports/components/MatchCard/components/DateTimeDisplay';
import { UnifiedButton } from '@/components/unified/UnifiedButton';
import { ArrowLeft, Calendar, MapPin, RefreshCw, Zap, WifiOff } from 'lucide-react';
import { getConditionStateInfo, isConditionActive } from '@/utils/conditionHelpers';
import { ConditionState } from '@/types';
import { useGame, useActiveMarkets } from '@azuro-org/sdk';
import type { Market, MarketOutcome } from '@azuro-org/toolkit';
import type { PredictionSelection } from '@/types';
import { logger } from '@/utils/logger';
import { convertOdds } from '@/utils/oddsCalculators';
import { useOddsFormat } from '@/contexts/OddsFormatContext';

interface OddsSelectionViewProps {
  matchId: string;
  sport: string;
  league: string;
  onBack: () => void;
  onSelectionConfirm: (selection: PredictionSelection) => void;
}

export function OddsSelectionView({ 
  matchId, 
  sport, 
  league, 
  onBack, 
  onSelectionConfirm 
}: OddsSelectionViewProps) {
  const { format } = useOddsFormat();
  // Utilisation directe du SDK Azuro comme dans MatchDetail
  const { 
    data: match = null, 
    isLoading: gameLoading, 
    error: gameError 
  } = useGame({
    gameId: matchId,
    chainId: 137,
    query: { 
      enabled: !!matchId,
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  });

  const { 
    data: markets = [], 
    isFetching: marketsLoading,
    error: marketsError,
    refetch: refetchMarkets
  } = useActiveMarkets({
    gameId: matchId,
    chainId: 137,
    query: { 
      enabled: !!matchId && !!match,
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  });

  const isLoading = gameLoading || marketsLoading;
  const error = gameError || marketsError;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const TeamAvatar = ({ team, variant }: { team?: any; variant: "A" | "B" }) => (
    <Avatar className="w-12 h-12 ring-2 ring-border/20">
      <AvatarImage 
        src={team?.image} 
        alt={team?.name || `Équipe ${variant}`}
      />
      <AvatarFallback asChild>
        <ThemeAvatarFallback 
          name={team?.name || `Team ${variant}`}
          variant="team"
          size="md"
        />
      </AvatarFallback>
    </Avatar>
  );

  const handleOddsSelection = (outcome: MarketOutcome, market: Market) => {
    if (!match) return;
    
    logger.debug('Odds selection:', { 
      conditionId: outcome.conditionId, 
      outcomeId: outcome.outcomeId,
      gameId: outcome.gameId,
      odds: outcome.odds,
      selectionName: outcome.selectionName 
    });
    
    const selection: PredictionSelection = {
      matchId,
      selectedOutcome: outcome,
      market,
      prediction: {
        matchTitle: `${match.participants[0]?.name} vs ${match.participants[1]?.name}`,
        predictionText: outcome.selectionName,
        odds: outcome.odds,
        sport,
        league,
      },
      // Native Azuro data (no wrapper)
      gameId: outcome.gameId,
      conditionId: outcome.conditionId,
      outcomeId: outcome.outcomeId,
      startsAt: match.startsAt,
      participants: match.participants,
    };
    
    logger.debug('Sending selection:', selection);
    onSelectionConfirm(selection);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchMarkets();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Network error</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please check your connection and try again.
          </p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !match) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted/50 rounded-xl"></div>
          <div className="h-32 bg-muted/50 rounded-xl"></div>
          <div className="h-24 bg-muted/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 max-h-[80vh] overflow-y-auto">
      {/* Header modernisé */}
      <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-accent/50 hover:scale-105 transition-all duration-200 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Choisir votre pronostic</h3>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="hover:bg-accent/50 hover:scale-105 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Match Info Card Premium */}
      <div className="relative bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-border/50 shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <TeamAvatar team={match?.participants[0]} variant="A" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">1</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 px-3">
                <span className="text-xs text-muted-foreground font-medium">VS</span>
                <div className="h-px w-8 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <div className="relative">
                <TeamAvatar team={match?.participants[1]} variant="B" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">2</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {match?.participants[0]?.name} <span className="text-muted-foreground font-normal text-sm">vs</span> {match?.participants[1]?.name}
              </span>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{league}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {match?.startsAt && (
              <div className="px-4 py-2 rounded-xl bg-accent/50 backdrop-blur-sm border border-border/30">
                <DateTimeDisplay 
                  startingAt={match.startsAt} 
                  viewMode="list"
                />
              </div>
            )}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">
              {match?.state || 'En attente'}
            </Badge>
          </div>
        </div>
      </div>


      {/* Markets Premium */}
      <div className="space-y-5">
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/50 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-sm font-medium">Cliquez sur une cote pour faire votre pronostic</span>
          </div>
        </div>
        
        {markets.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in-0 duration-500">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex items-center justify-center shadow-inner backdrop-blur-sm border border-border/30">
              <span className="text-3xl animate-pulse">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune cote disponible</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Les cotes pour ce match ne sont pas encore disponibles
            </p>
          </div>
        ) : (
          markets.map((market) => {
            const firstActiveCondition = market.conditions?.find(condition => 
              isConditionActive(condition.state as ConditionState)
            ) ?? market.conditions?.[0];
            
            if (!firstActiveCondition?.outcomes?.length) return null;

            const conditionStateInfo = getConditionStateInfo(firstActiveCondition.state as ConditionState);
            const isActive = isConditionActive(firstActiveCondition.state as ConditionState);

            return (
              <div 
                key={market.marketKey} 
                className="relative group bg-card/60 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:bg-card/80 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative flex items-center justify-center gap-2 mb-5">
                  <div className="h-1 w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
                  <h4 className="font-semibold text-center text-lg">{market.name}</h4>
                  <div className="h-1 w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
                  {conditionStateInfo && (
                    <div className="flex items-center gap-1" title={conditionStateInfo.label}>
                      <conditionStateInfo.icon className={`h-4 w-4 ${conditionStateInfo.className}`} />
                    </div>
                  )}
                </div>
                
                <div className="relative grid grid-cols-1 gap-3">
                  {firstActiveCondition.outcomes.map((outcome, index) => (
                    <div 
                      key={`${outcome.conditionId}-${outcome.outcomeId}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-in fade-in-0 slide-in-from-left-4"
                    >
                      <UnifiedButton
                        buttonType="odds"
                        label={outcome.selectionName || `Outcome ${outcome.outcomeId}`}
                        sublabel={outcome.odds ? convertOdds(outcome.odds, format) : '0.00'}
                        onClick={() => {
                          logger.debug('UnifiedButton clicked:', outcome);
                          handleOddsSelection(outcome, market);
                        }}
                        isSelected={false}
                        className={`w-full justify-between p-5 text-base font-medium rounded-xl transition-all duration-300 ${
                          !isActive 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-primary/10 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer active:scale-95'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
