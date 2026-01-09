import React from 'react';
import { X } from 'lucide-react';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import type { BetMode } from '../../types';

interface TotalQuoteRowProps {
  selections: AzuroSDK.BetslipItem[];
  mode: BetMode;
  selectionsCount: number;
  totalOdds: number;
  onClearAll: () => void;
}

export function TotalQuoteRow({ selections, mode, selectionsCount, totalOdds, onClearAll }: TotalQuoteRowProps) {
  const { formattedOdds } = useOddsDisplay({ odds: totalOdds });

  return (
    <div className="flex items-center justify-between h-6 py-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          TOTAL QUOTE:
        </span>
        <span className="text-xs font-bold text-foreground min-w-[60px]">
          {formattedOdds}
        </span>
      </div>
      
      <button
        onClick={onClearAll}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        <span>CLEAR ALL</span>
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}