// Sports betting style odds display for Polymarket - Simplified

import React from 'react';
import { PolymarketOddsButton } from './PolymarketOddsButton';
import { cn } from '@/lib/utils';

export interface PolymarketOddsDisplayProps {
  yesBuyPrice: number;       // bestAsk for YES
  noBuyPrice: number;        // synthetic price (1 - bestBid) for NO
  isTradable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;         // Compact mode for mobile cards
  isLive?: boolean;          // True if using real CLOB prices
  onBuyYes?: () => void;
  onBuyNo?: () => void;
  className?: string;
}

export const PolymarketOddsDisplay: React.FC<PolymarketOddsDisplayProps> = ({
  yesBuyPrice,
  noBuyPrice,
  isTradable = true,
  disabled = false,
  size = 'md',
  compact = false,
  isLive = false,
  onBuyYes,
  onBuyNo,
  className,
}) => {
  // Don't render if market is not tradable
  if (!isTradable) {
    return null;
  }

  // Check for invalid prices
  const hasValidPrices = yesBuyPrice > 0 && yesBuyPrice < 1 && noBuyPrice > 0 && noBuyPrice < 1;

  return (
    <div className={cn('relative', className)}>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute -top-2 right-0 flex items-center gap-1 text-[10px] text-green-500 font-medium z-10">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      )}
      
      <div className="flex gap-2 w-full">
        <PolymarketOddsButton
          side="YES"
          buyPrice={yesBuyPrice}
          disabled={disabled}
          size={size}
          compact={compact}
          onClick={onBuyYes}
          className="flex-1"
        />
        <PolymarketOddsButton
          side="NO"
          buyPrice={noBuyPrice}
          disabled={disabled}
          size={size}
          compact={compact}
          onClick={onBuyNo}
          className="flex-1"
        />
      </div>
    </div>
  );
};
