import React from 'react';
import { formatVolume } from '../../utils/formatters';
import { MarketFooterProps } from '../../types/ui';

export const MarketCardFooter: React.FC<MarketFooterProps> = ({
  volume,
  periodicity
}) => {
  return (
    <div className="pt-2 sm:pt-3 border-t border-border">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-caption text-muted-foreground truncate">
          {formatVolume(volume)} Vol.
        </span>
        {periodicity && (
          <>
            <span className="text-xs sm:text-caption text-muted-foreground hidden sm:inline">•</span>
            <span className="text-xs sm:text-caption text-muted-foreground truncate hidden sm:inline">
              {periodicity}
            </span>
          </>
        )}
      </div>
    </div>
  );
};