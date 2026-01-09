// Sports betting style button for Polymarket - Simplified

import React from 'react';
import { cn } from '@/lib/utils';
import { formatOdds, isExtremeOdds, priceToOdds } from '../../utils/oddsFormatter';

export interface PolymarketOddsButtonProps {
  side: 'YES' | 'NO';
  buyPrice: number;          // bestAsk for YES, synthetic for NO (0-1 range)
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;         // Compact mode: single line, no percentage
  onClick?: () => void;
  className?: string;
}

export const PolymarketOddsButton: React.FC<PolymarketOddsButtonProps> = ({
  side,
  buyPrice,
  disabled = false,
  size = 'md',
  compact = false,
  onClick,
  className,
}) => {
  const isYes = side === 'YES';

  // Simple validation
  const isValidPrice = buyPrice > 0 && buyPrice < 1 && isFinite(buyPrice) && !isNaN(buyPrice);
  
  // Calculate and format odds
  const odds = isValidPrice ? priceToOdds(buyPrice) : 0;
  const displayOdds = isValidPrice ? formatOdds(odds) : '';
  const isExtreme = isExtremeOdds(odds);
  const probability = isValidPrice ? buyPrice * 100 : 0;

  const sizeClasses = compact ? {
    sm: 'px-2 py-1.5 text-xs min-w-[65px]',
    md: 'px-3 py-2 text-sm min-w-[75px]',
    lg: 'px-3 py-2 text-sm min-w-[80px]',
  } : {
    sm: 'px-3 py-2 text-sm min-w-[70px]',
    md: 'px-4 py-3 text-base min-w-[90px]',
    lg: 'px-5 py-4 text-lg min-w-[110px]',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
        'border-2 shadow-sm',
        'hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm',
        sizeClasses[size],
        compact ? 'flex-row gap-1.5' : 'flex-col',
        isYes && [
          'bg-green-600 border-green-500 text-white',
          'hover:bg-green-700 hover:border-green-600',
          'active:bg-green-800',
        ],
        !isYes && [
          'bg-red-600 border-red-500 text-white',
          'hover:bg-red-700 hover:border-red-600',
          'active:bg-red-800',
        ],
        className
      )}
    >
      {compact ? (
        <>
          <span className="text-xs font-medium opacity-90">{side}</span>
          {displayOdds && <span className="font-bold">{displayOdds}</span>}
        </>
      ) : (
        <>
          <span className="text-xs opacity-80">{side}</span>
          {displayOdds && (
            <span className={cn('font-bold', isExtreme ? 'text-sm' : 'text-lg')}>
              {displayOdds}
            </span>
          )}
          {displayOdds && <span className="text-xs opacity-75">{probability.toFixed(0)}%</span>}
        </>
      )}
    </button>
  );
};
