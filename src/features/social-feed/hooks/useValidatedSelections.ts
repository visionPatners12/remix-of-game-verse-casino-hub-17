import { useMemo } from 'react';
import type { FeedSelection } from '@/types/selection';
import { logger } from '@/utils/logger';

// Re-export for backward compatibility
export type { FeedSelection } from '@/types/selection';

/**
 * Type guard to check if unknown value has selection-like structure
 */
function isSelectionLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Centralized validation hook for selections with two modes:
 * - 'display': Validates only odds/market/outcome (for calculations and display)
 * - 'betting': Validates all fields including conditionId/outcomeId (for adding to ticket)
 */
export function useValidatedSelections(
  rawSelections: unknown[],
  context?: string,
  mode: 'display' | 'betting' = 'display'
): FeedSelection[] {
  return useMemo(() => {
    return rawSelections.filter((sel): sel is FeedSelection => {
      if (!isSelectionLike(sel)) return false;
      
      const hasDisplayData = !!(
        sel.marketType &&
        sel.pick &&
        typeof sel.odds === 'number' &&
        sel.odds > 0
      );
      
      const hasBettingData = hasDisplayData && 
        !!(sel.conditionId && sel.outcomeId);
      
      const isValid = mode === 'display' ? hasDisplayData : hasBettingData;
      
      if (!isValid) {
        logger.error(
          `[${context || 'Selection'}] Invalid selection (${mode} mode):`,
          {
            marketType: sel.marketType,
            pick: sel.pick,
            odds: sel.odds,
            ...(mode === 'betting' && {
              conditionId: sel.conditionId,
              outcomeId: sel.outcomeId
            })
          }
        );
      }
      
      return isValid;
    });
  }, [rawSelections, context, mode]);
}
