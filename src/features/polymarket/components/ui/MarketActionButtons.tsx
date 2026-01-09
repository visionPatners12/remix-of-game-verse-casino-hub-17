import React from 'react';
import { ExtendedActionButtonsProps } from '../../types/ui';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

export const MarketActionButtons: React.FC<ExtendedActionButtonsProps> = ({
  marketId,
  size = 'small',
  disabled = false,
  yesOdds = 1.5,
  noOdds = 1.5,
  showReadonly = false
}) => {
  const { formattedOdds: formattedYesOdds } = useOddsDisplay({ odds: yesOdds });
  const { formattedOdds: formattedNoOdds } = useOddsDisplay({ odds: noOdds });
  const handleYesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Display only - no action needed
  };

  const handleNoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Display only - no action needed
  };

  if (size === 'large') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <button 
          className="flex items-center justify-between bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 rounded px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleYesClick}
          disabled={disabled || showReadonly}
        >
          <span>YES</span>
          <span className="font-semibold ml-1">
            {formattedYesOdds}
          </span>
        </button>
        <button 
          className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNoClick}
          disabled={disabled || showReadonly}
        >
          <span>NO</span>
          <span className="font-semibold ml-1">
            {formattedNoOdds}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button 
        className="flex items-center justify-between bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 rounded px-3 py-2 text-xs font-medium w-[90px] h-[32px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleYesClick}
        disabled={disabled || showReadonly}
      >
        <span>Yes</span>
        <span className="font-semibold ml-1">
          {formattedYesOdds}
        </span>
      </button>
      <button 
        className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded px-3 py-2 text-xs font-medium w-[90px] h-[32px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleNoClick}
        disabled={disabled || showReadonly}
      >
        <span>No</span>
        <span className="font-semibold ml-1">
          {formattedNoOdds}
        </span>
      </button>
    </div>
  );
};