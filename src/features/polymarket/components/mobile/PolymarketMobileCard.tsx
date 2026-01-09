import React, { memo, useMemo, useCallback } from 'react';
import { PolymarketMarket } from '../../types/events';
import { EnrichedPolymarketEvent } from '../../types/events';
import { Button } from '@/components/ui/button';
import { CircularGauge } from '../ui/CircularGauge';
import { ReactionSection } from '../ui/ReactionSection';
import { getPrimaryMarket, getYesPercentage, determineTemplate, parseOutcomes, parseOutcomePrices } from '../../utils/helpers';
import { formatPercentage } from '../../utils/formatters';
import { getTokenIdsFromMarket, getMarketPrices } from '../../utils/tokenUtils';
import { MarketCardCallbacks } from '../../types/ui';
import { ChevronRight } from 'lucide-react';
import { formatTimeAgo as formatTimeAgoDeprecated } from '@/utils/dateUtils';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

// Helper component for formatted odds display
const FormattedOdds: React.FC<{ odds: number }> = memo(({ odds }) => {
  const { formattedOdds } = useOddsDisplay({ odds });
  return <span className="font-semibold ml-1">{formattedOdds}</span>;
});
FormattedOdds.displayName = 'FormattedOdds';

interface PolymarketMobileCardProps extends MarketCardCallbacks {
  event: EnrichedPolymarketEvent;
}

export const PolymarketMobileCard: React.FC<PolymarketMobileCardProps> = memo(({
  event,
  onView,
  onOpenDetails
}) => {
  // Memoize expensive calculations
  const template = useMemo(() => determineTemplate(event), [event]);
  const primaryMarket = useMemo(() => getPrimaryMarket(event), [event]);
  const volume = useMemo(() => event.volume || 0, [event.volume]);
  const formattedTime = useMemo(() => formatTimeAgoDeprecated(event.endDate), [event.endDate]);

  const handleCardClick = useCallback(() => {
    onOpenDetails?.(event.id, event.title);
  }, [onOpenDetails, event.id, event.title]);

  const handleBuyClick = useCallback((e: React.MouseEvent, side: 'YES' | 'NO', market?: PolymarketMarket) => {
    e.stopPropagation();
    const targetMarket = market || primaryMarket;
    const tokenIds = getTokenIdsFromMarket(targetMarket);
    const prices = getMarketPrices(targetMarket);
    const odds = side === 'YES' ? prices.yesPrice || 0.5 : prices.noPrice || 0.5;
    
    onView?.({ 
      marketId: targetMarket.id, 
      side,
      eventTitle: event.title,
      marketQuestion: targetMarket.question
    });
  }, [onView, primaryMarket, event.title]);

  // Static values to avoid Math.random() recalculations
  const staticReactionData = useMemo(() => ({
    likes: 25,
    comments: 12,
    shares: 8
  }), []);

  if (template === 'A') {
    // Multiple markets or non-binary market
    return (
      <article className="hover:bg-muted/30 transition-all duration-200 cursor-pointer border-b border-border/50">
        <div className="px-4 py-3" onClick={handleCardClick}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Event Icon */}
              {event.icon && (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5 bg-muted/50 flex items-center justify-center">
                  <img 
                    src={event.icon} 
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight text-foreground mb-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Ends {new Date(event.endDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
            
            {/* Market Count */}
            {event.markets.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-violet-500 flex-shrink-0">
                <span>+{event.markets.length}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Markets List - Only active markets */}
          <div className="space-y-3 mb-3">
            {event.markets
              .filter((market) => !market.closed && market.active)
              .slice(0, 3)
              .map((market) => {
              const outcomes = parseOutcomes(market.outcomes);
              const prices = parseOutcomePrices(market.outcomePrices);
              
              if (outcomes.length === 2 && outcomes.includes('Yes') && outcomes.includes('No')) {
                // Binary market
                const rawYesPrice = prices[0] ? parseFloat(prices[0]) : 0.5;
                const yesPrice = isNaN(rawYesPrice) || rawYesPrice <= 0 || rawYesPrice >= 1 ? 0.5 : rawYesPrice;
                
                return (
                  <div key={market.id} className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                      {market.groupItemTitle || market.question}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        className="flex items-center justify-between bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 rounded px-3 py-2 text-xs font-medium flex-1 h-[32px] transition-colors"
                        onClick={(e) => handleBuyClick(e, 'YES', market)}
                      >
                        <span>Yes</span>
                        <FormattedOdds odds={1/yesPrice} />
                      </button>
                      <button 
                        className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded px-3 py-2 text-xs font-medium flex-1 h-[32px] transition-colors"
                        onClick={(e) => handleBuyClick(e, 'NO', market)}
                      >
                        <span>No</span>
                        <FormattedOdds odds={1/(1-yesPrice)} />
                      </button>
                    </div>
                  </div>
                );
              } else {
                // Multi-outcome market - each outcome has its own price
                return (
                  <div key={market.id} className="space-y-1">
                    <span className="text-sm font-medium text-foreground">
                      {market.groupItemTitle || market.question}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {outcomes.slice(0, 4).map((outcome, idx) => {
                        // Get price for THIS specific outcome
                        const rawOutcomePrice = prices[idx] ? parseFloat(prices[idx]) : 0.5;
                        const outcomePrice = isNaN(rawOutcomePrice) || rawOutcomePrice <= 0 || rawOutcomePrice >= 1 
                          ? 0.5 
                          : rawOutcomePrice;
                        const odds = outcomePrice > 0 ? 1 / outcomePrice : 2;
                        
                        return (
                          <button
                            key={idx}
                            className="flex items-center justify-between bg-muted border border-border text-foreground hover:bg-muted/80 rounded px-3 py-2 text-xs font-medium h-[32px] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView?.({ 
                                marketId: market.id, 
                                side: outcome as 'YES' | 'NO',
                                eventTitle: event.title,
                                marketQuestion: market.question,
                                buyPrice: outcomePrice
                              });
                            }}
                          >
                            <span className="truncate flex-1">{outcome}</span>
                            <FormattedOdds odds={odds} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* Reaction Section */}
          <div className="mt-3">
            <ReactionSection
              eventId={event.id}
              marketId={event.id}
              commentsCount={event.comments_count ?? 0}
            />
          </div>
        </div>
      </article>
    );
  }

  // Template B - Single binary market
  const yesPercentage = getYesPercentage(primaryMarket);
  const prices = parseOutcomePrices(primaryMarket.outcomePrices);
  const rawYesPrice = prices[0] ? parseFloat(prices[0]) : 0.5;
  const rawNoPrice = prices[1] ? parseFloat(prices[1]) : 0.5;
  // Validate prices to avoid NaN and division by zero
  const yesOdds = isNaN(rawYesPrice) || rawYesPrice <= 0 || rawYesPrice >= 1 ? 0.5 : rawYesPrice;
  const noOdds = isNaN(rawNoPrice) || rawNoPrice <= 0 || rawNoPrice >= 1 ? 0.5 : rawNoPrice;

  return (
    <article className="hover:bg-muted/30 transition-all duration-200 cursor-pointer border-b border-border/50">
      <div className="px-4 py-3" onClick={handleCardClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Event Icon */}
            {event.icon && (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5 bg-muted/50 flex items-center justify-center">
                <img 
                  src={event.icon} 
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight text-foreground mb-1">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Ends {new Date(event.endDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          
          {/* Circular Gauge */}
          <div className="ml-3 flex-shrink-0">
            <CircularGauge percentage={yesPercentage} size={40} strokeWidth={4} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button 
            className="flex items-center justify-between bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 rounded px-3 py-2 text-xs font-medium flex-1 h-[32px] transition-colors"
            onClick={(e) => handleBuyClick(e, 'YES')}
          >
            <span>Yes</span>
            <FormattedOdds odds={1/yesOdds} />
          </button>
          <button 
            className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded px-3 py-2 text-xs font-medium flex-1 h-[32px] transition-colors"
            onClick={(e) => handleBuyClick(e, 'NO')}
          >
            <span>No</span>
            <FormattedOdds odds={1/noOdds} />
          </button>
        </div>

        {/* Reaction Section */}
        <div className="mt-3">
          <ReactionSection
            eventId={event.id}
            marketId={event.id}
            commentsCount={event.comments_count ?? 0}
          />
        </div>
      </div>
    </article>
  );
});