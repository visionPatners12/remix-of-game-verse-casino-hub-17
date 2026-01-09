// ===== ODDS DISPLAY HOOK =====

import { useMemo } from 'react';
import { convertOdds, calculateProbability } from '@/utils/oddsCalculators';
import { useOddsFormat } from '@/contexts/OddsFormatContext';
import type { OddsFormat } from '@/types/oddsFormat';
import type { OddsDisplayHook } from '@/shared/ui/buttons/types';

interface UseOddsDisplayOptions {
  odds: number;
  format?: OddsFormat;
  precision?: number;
}

export function useOddsDisplay({ 
  odds, 
  format: propFormat, 
  precision = 2 
}: UseOddsDisplayOptions): OddsDisplayHook {
  const { format: contextFormat } = useOddsFormat();
  const format = propFormat ?? contextFormat;
  
  const { formattedOdds, displayOdds, probabilityPercent } = useMemo(() => {
    const safeOdds = Math.max(1.01, odds || 1.01);
    
    return {
      formattedOdds: convertOdds(safeOdds, format),
      displayOdds: parseFloat(safeOdds.toFixed(precision)),
      probabilityPercent: calculateProbability(safeOdds)
    };
  }, [odds, format, precision]);

  return {
    formattedOdds,
    displayOdds,
    probabilityPercent
  };
}