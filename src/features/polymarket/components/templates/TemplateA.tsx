import React, { useState, useMemo, useCallback, memo } from 'react';
import { Badge, Button } from '@/ui';
import { ChevronRight } from 'lucide-react';
import { PolymarketOddsDisplay } from '../ui/PolymarketOddsDisplay';
import { MarketCardFooter } from '../ui/MarketCardFooter';
import { AllMarketsModal } from '../modals/AllMarketsModal';
import { ReactionSection } from '../ui/ReactionSection';
import { EnrichedTemplateProps, MarketRowDataWithMarket } from '../../types/ui';
import { PolymarketMarket } from '../../types/events';
import { 
  parseOutcomes, 
  parseOutcomePrices, 
  getMarketLabel
} from '../../utils/helpers';
import { getClobPrices } from '../../utils/priceUtils';

export const TemplateA: React.FC<EnrichedTemplateProps> = memo(({
  event,
  isResolved = false,
  onView
}) => {
  const [showAllMarkets, setShowAllMarkets] = useState(false);
  
  // Get CLOB prices from the event (attached by usePolymarketEventById)
  const clobPrices = event._clobPrices ?? null;
  
  // Memoize rows data calculation - using CLOB prices when available
  const getRowsData = useCallback((): MarketRowDataWithMarket[] => {
    const { markets } = event;
    
    if (markets.length === 1) {
      // Single market with multiple outcomes
      const market = markets[0];
      const outcomes = parseOutcomes(market.outcomes);
      const prices = parseOutcomePrices(market.outcomePrices);
      
      return outcomes.map((outcome, index) => {
        // Get price specific to this outcome
        const rawPrice = prices[index] ? parseFloat(prices[index]) : 0.5;
        const outcomePrice = isNaN(rawPrice) ? 0.5 : Math.max(0.01, Math.min(0.99, rawPrice));
        
        return {
          id: `${market.id}-${index}`,
          label: outcome,
          percentage: outcomePrice * 100,
          yesBuyPrice: outcomePrice,        // Prix specifique a cet outcome
          noBuyPrice: 1 - outcomePrice,     // Inverse pour cet outcome
          isLive: false,
          outcomes: outcomes,
          market: market,
          outcomeIndex: index               // Index pour le trading
        };
      });
    } else {
      // Multiple binary markets
      return markets.map(market => {
        // Use CLOB prices for each market
        const { yesBuyPrice, noBuyPrice, isLive } = getClobPrices(market, clobPrices);
        
        return {
          id: market.id,
          label: getMarketLabel(market),
          percentage: yesBuyPrice * 100,
          yesBuyPrice,
          noBuyPrice,
          isLive,
          outcomes: parseOutcomes(market.outcomes),
          market: market
        };
      });
    }
  }, [event, clobPrices]);

  const allRows = useMemo(() => getRowsData(), [getRowsData]);
  const maxDisplayed = 3;
  const displayedRows = useMemo(() => allRows.slice(0, maxDisplayed), [allRows]);
  const hasMore = allRows.length > maxDisplayed;
  const remainingCount = allRows.length - maxDisplayed;
  
  const primaryMarket = useMemo(() => event.markets[0], [event.markets]);
  const image = useMemo(() => event.icon || event.image, [event.icon, event.image]);

  // Get likes and comments counts from event data
  const likesCount = event.likes_count ?? 0;
  const commentsCount = event.comments_count ?? 0;

  // Handle buy actions - now passes buyPrice
  const handleBuy = useCallback((marketId: string, side: 'YES' | 'NO', market: PolymarketMarket, buyPrice: number) => {
    if (onView) {
      onView({
        marketId,
        side,
        eventTitle: event.title,
        marketQuestion: market.question || market.groupItemTitle || event.title,
        buyPrice,
      });
    }
  }, [event.title, onView]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Resolved badge overlay */}
      {isResolved && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <Badge variant="secondary" className="text-caption px-2 py-1">
            Resolved
          </Badge>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 flex-shrink-0">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          {image && (
            <div className="flex-shrink-0">
              <img 
                src={image} 
                alt=""
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 className="text-sm sm:text-subtitle font-semibold line-clamp-2 text-foreground min-w-0">
            {event.title}
          </h3>
        </div>
        
        {/* Show all button in top-right */}
        {hasMore && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllMarkets(true);
              }}
            >
              <span>All ({allRows.length})</span>
              <ChevronRight className="h-3 w-3 ml-1 text-primary" />
            </Button>
          </div>
        )}
      </div>

      {/* Body - Market rows */}
      <div className="flex-1 mb-3">
        <div className="space-y-1">
          {displayedRows.map((row, index) => {
            const isTradable = row.market.active !== false && !row.market.closed && Number(row.market.liquidity || 0) >= 100;
            
            return (
              <div key={row.id}>
                <div className="flex flex-col gap-1.5 py-2 min-h-[40px] group hover:bg-muted/30 rounded-lg transition-smooth px-2 -mx-2">
                  {/* Label - now allows 2 lines */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-foreground line-clamp-2 min-w-0 flex-1 pr-2 font-medium leading-tight">
                      {row.label}
                    </span>
                  </div>
                  
                  {/* Odds buttons - compact mode */}
                  <PolymarketOddsDisplay
                    yesBuyPrice={row.yesBuyPrice}
                    noBuyPrice={row.noBuyPrice}
                    isTradable={isTradable}
                    disabled={isResolved}
                    size="sm"
                    compact={true}
                    isLive={row.isLive}
                    onBuyYes={() => handleBuy(row.id, 'YES', row.market, row.yesBuyPrice)}
                    onBuyNo={() => handleBuy(row.id, 'NO', row.market, row.noBuyPrice)}
                  />
                </div>
                
                {/* Separator (except for last item) */}
                {index < displayedRows.length - 1 && (
                  <div className="border-b border-border/50 my-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <MarketCardFooter
        volume={event.volume || primaryMarket.volumeNum || 0}
      />
      
      {/* Reaction Section */}
      <ReactionSection
        eventId={event.id}
        marketId={primaryMarket.id}
        commentsCount={commentsCount}
      />

      {/* All Markets Modal */}
      <AllMarketsModal
        isOpen={showAllMarkets}
        onClose={() => setShowAllMarkets(false)}
        eventTitle={event.title}
        markets={allRows}
        onView={onView}
        isResolved={isResolved}
        event={event}
      />
    </div>
  );
});
