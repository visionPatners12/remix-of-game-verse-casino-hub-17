import React from 'react';
import { OddsButton } from '@/shared/ui/buttons';
import { OddsFormat, MarketSelection } from '@/types/oddsFormat';
import type { PolymarketSide } from '@/shared/ui/buttons/types';

interface OddsPillProps {
  side: 'FOR' | 'AGAINST';
  label: string;
  price: number;
  format: OddsFormat;
  disabled?: boolean;
  onSelect?: (selection: MarketSelection) => void;
  marketId: string;
}

export const OddsPill: React.FC<OddsPillProps> = ({
  side,
  label,
  price,
  format,
  disabled = false,
  onSelect,
  marketId
}) => {
  // Convert FOR/AGAINST to YES/NO for compatibility
  const polymarketSide: PolymarketSide = side === 'FOR' ? 'YES' : 'NO';
  
  const handleSelect = (selection: { marketId: string; side: PolymarketSide }) => {
    if (onSelect) {
      // Convert back to original format
      const originalSide = selection.side === 'YES' ? 'FOR' : 'AGAINST';
      onSelect({ marketId: selection.marketId, side: originalSide });
    }
  };

  return (
    <OddsButton
      variant="prediction"
      marketId={marketId}
      side={polymarketSide}
      label={label}
      odds={price}
      format={format}
      disabled={disabled}
      onSelect={handleSelect}
      className="h-10 sm:h-12 px-3 py-2 sm:px-4 sm:py-3"
    />
  );
};