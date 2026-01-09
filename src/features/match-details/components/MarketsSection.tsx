import React, { memo, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { 
  LoadingSpinner, 
  Button, 
  Badge, 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/ui";
import { getConditionStateInfo, isConditionActive } from "@/utils/conditionHelpers";
import { ConditionState } from "@/types";
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';
import type { Market, MarketOutcome, GameMarkets } from '@azuro-org/toolkit';
import { OddsButton } from "@/shared/ui/buttons";
import { useOddsSelection } from "@/shared/hooks/useOddsSelection";
import { CompoundMarketGrid } from "./CompoundMarketGrid";
import { isCompoundMarket, getCompoundMarketConfig } from "../utils/compoundMarketUtils";
import { WebActionGate } from "@/components/web";

// Layout helper functions
function calculateButtonsPerRow(outcomes: { outcome: MarketOutcome }[]): number {
  if (!outcomes.length) return 3;
  
  const avgLength = outcomes.reduce(
    (sum, { outcome }) => sum + (outcome.selectionName?.length || 0), 
    0
  ) / outcomes.length;
  
  if (avgLength > 40) return 1;
  if (avgLength > 25) return 2;
  return 3;
}

function groupOutcomesIntoRows<T>(outcomes: T[], buttonsPerRow: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < outcomes.length; i += buttonsPerRow) {
    rows.push(outcomes.slice(i, i + buttonsPerRow));
  }
  return rows;
}

function getTeamType(outcomeIndex: number, totalOutcomes: number): 'home' | 'draw' | 'away' {
  if (outcomeIndex === 0) return 'home';
  if (totalOutcomes === 3 && outcomeIndex === 1) return 'draw';
  return 'away';
}

interface MarketsSectionProps {
  match: SupabaseMatchData;
  markets: GameMarkets;
  isPredictionMode: boolean;
  baseBetslip: any;
}

export const MarketsSection = memo(function MarketsSection({ 
  match,
  markets = [],
  isPredictionMode, 
  baseBetslip 
}: MarketsSectionProps) {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  
  const { items = [], addItem = () => {} } = baseBetslip || {};

  // Get team names directly from match data
  const teamAName = match.home;
  const teamBName = match.away;
  const eventName = `${teamAName} vs ${teamBName}`;

  const handleOddsClick = useCallback((outcome: MarketOutcome, market: Market, conditionState: ConditionState) => {
    if (!isConditionActive(conditionState)) return;
    
    if (isPredictionMode) {
      navigate('/create-post', { 
        state: { 
          postType: 'prediction',
          selectedPrediction: {
            matchTitle: eventName,
            predictionText: outcome.selectionName || '',
            odds: outcome.odds || 0,
            sport: match.sport.name,
            league: match.league,
            participants: [
              { name: teamAName },
              { name: teamBName }
            ],
            gameId: match.azuro_game_id || match.id,
            conditionId: outcome.conditionId,
            outcomeId: outcome.outcomeId,
            startsAt: match.start_iso,
            market: market,
            selectedOutcome: outcome
          }
        } 
      });
    }
  }, [isPredictionMode, navigate, eventName, match, teamAName, teamBName]);

  const isSelected = useCallback((outcome: MarketOutcome) => {
    return items.some((item: any) => item.conditionId === outcome.conditionId && item.outcomeId === outcome.outcomeId);
  }, [items]);

  const sortedMarketsAndOutcomes = useMemo(() => {
    if (!markets?.length) return [];

    return markets
      .map((market) => {
        const conditionState = getConditionStateInfo(market.conditions?.[0]?.state as ConditionState);
        const outcomes = market.conditions?.[0]?.outcomes || [];
        
        return {
          market,
          conditionState,
          outcomes: outcomes.map((outcome: any) => ({ outcome, conditionState }))
        };
      })
      .sort((a, b) => {
        const aIsActive = isConditionActive(a.conditionState?.isActive ? ConditionState.Active : ConditionState.Stopped);
        const bIsActive = isConditionActive(b.conditionState?.isActive ? ConditionState.Active : ConditionState.Stopped);
        
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        return 0;
      });
  }, [markets]);

  // No markets available
  if (!match.azuro_game_id) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-medium mb-2">No markets available</p>
        <p className="text-sm">This match doesn't have active markets yet.</p>
      </div>
    );
  }

  if (!sortedMarketsAndOutcomes.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No markets available for this match</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {sortedMarketsAndOutcomes.map(({ market, conditionState, outcomes }: any) => {
        const isActive = conditionState?.isActive !== false;
        const actualConditionState = isActive ? ConditionState.Active : 
          (market.conditions?.[0]?.state as ConditionState) || ConditionState.Stopped;
        
        return (
          <div key={market.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{market.name}</h3>
                {market.description && (
                  <Popover 
                    open={openPopover === market.name} 
                    onOpenChange={(open) => setOpenPopover(open ? market.name : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Info className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">{market.name}</h4>
                        <p className="text-sm text-muted-foreground">{market.description}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            
            {/* Display outcomes - use grid for compound markets, dynamic layout for simple */}
            {isCompoundMarket(market.name) && getCompoundMarketConfig(market.name) ? (
              <CompoundMarketGrid
                market={market}
                outcomes={outcomes.map((o: any) => o.outcome)}
                onSelect={(outcome) => handleOddsClick(outcome, market, actualConditionState)}
                isSelected={isSelected}
                disabled={!isActive}
                match={match}
                conditionState={actualConditionState}
              />
            ) : (
              <div className="space-y-2">
                {(() => {
                  const buttonsPerRow = calculateButtonsPerRow(outcomes);
                  const outcomeRows = groupOutcomesIntoRows(outcomes, buttonsPerRow);
                  
                  return outcomeRows.map((rowOutcomes, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2">
                      {/* Show pause icon only for the first row */}
                      {rowIndex === 0 && !isActive && conditionState && (
                        React.createElement(conditionState.icon, { 
                          className: `h-4 w-4 ${conditionState.className}` 
                        })
                      )}
                      {rowOutcomes.map(({ outcome }: any, index: number) => {
                        const globalIndex = rowIndex * buttonsPerRow + index;
                        const selected = isSelected(outcome);
                        const teamType = getTeamType(globalIndex, outcomes.length);
                        
                        return (
                          <div key={outcome.outcomeId} className="flex-1">
                            <WebActionGate action="bet">
                              <OddsButton
                                variant="sport"
                                odds={outcome.odds}
                                label={outcome.selectionName}
                                outcome={outcome}
                                teamType={teamType}
                                isSelected={selected}
                                disabled={!isActive}
                                onSelect={() => handleOddsClick(outcome, market, actualConditionState)}
                                gameId={match.azuro_game_id || match.id}
                                eventName={eventName}
                                marketType={market.name}
                                participants={[
                                   { name: teamAName, image: match.home_team?.logo || null },
                                   { name: teamBName, image: match.away_team?.logo || null }
                                 ]}
                                sport={match.sport ? { name: match.sport.name, slug: match.sport.slug } : undefined}
                                league={match.league_info ? { 
                                  name: match.league_info.name, 
                                  slug: match.league_info.slug,
                                  logo: match.league_info.logo 
                                } : { 
                                  name: match.league, 
                                  slug: match.league_azuro_slug || '' 
                                }}
                                startsAt={match.start_iso}
                                className="w-full"
                              />
                            </WebActionGate>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
