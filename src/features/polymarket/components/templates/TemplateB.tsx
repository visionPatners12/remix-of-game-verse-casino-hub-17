import React, { memo, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { CircularGauge } from '../ui/CircularGauge';
import { PolymarketOddsDisplay } from '../ui/PolymarketOddsDisplay';
import { MarketCardFooter } from '../ui/MarketCardFooter';
import { ReactionSection } from '../ui/ReactionSection';
import { EnrichedTemplateProps } from '../../types/ui';
import { getPrimaryMarket } from '../../utils/helpers';
import { getClobPrices } from '../../utils/priceUtils';

export const TemplateB: React.FC<EnrichedTemplateProps> = memo(({
  event,
  isResolved = false,
  onView
}) => {
  // Get likes and comments counts from event data
  const likesCount = event.likes_count ?? 0;
  const commentsCount = event.comments_count ?? 0;
  
  const primaryMarket = getPrimaryMarket(event);
  
  // Get CLOB prices from the event (attached by usePolymarketEventById)
  const clobPrices = event._clobPrices ?? null;
  
  // Use CLOB prices for accurate buy prices
  const { yesBuyPrice, noBuyPrice, isLive } = getClobPrices(primaryMarket, clobPrices);
  
  const image = event.icon || event.image;
  const isTradable = primaryMarket.active !== false && !primaryMarket.closed && Number(primaryMarket.liquidity || 0) >= 100;

  // Handle buy actions - now passes buyPrice
  const handleBuy = useCallback((side: 'YES' | 'NO') => {
    const buyPrice = side === 'YES' ? yesBuyPrice : noBuyPrice;
    if (onView) {
      onView({
        marketId: primaryMarket.id,
        side,
        eventTitle: event.title,
        marketQuestion: primaryMarket.question || primaryMarket.groupItemTitle || event.title,
        buyPrice,
      });
    }
  }, [primaryMarket, event.title, onView, yesBuyPrice, noBuyPrice]);

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
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 flex-shrink-0">
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
          
          <h3 className="text-sm sm:text-subtitle font-semibold text-foreground min-w-0">
            {event.title}
          </h3>
        </div>
        
        {/* Circular gauge in top-right */}
        <div className="flex-shrink-0">
          <CircularGauge 
            percentage={yesBuyPrice * 100}
            size={36}
            strokeWidth={3}
          />
        </div>
      </div>

      {/* Body - Action buttons using CLOB prices */}
      <div className="flex-1 mb-3">
        <PolymarketOddsDisplay
          yesBuyPrice={yesBuyPrice}
          noBuyPrice={noBuyPrice}
          isTradable={isTradable}
          disabled={isResolved}
          size="md"
          compact={true}
          isLive={isLive}
          onBuyYes={() => handleBuy('YES')}
          onBuyNo={() => handleBuy('NO')}
        />
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
    </div>
  );
});
