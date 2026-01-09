import type { OddsSelection } from '@/types/selection';

/**
 * Calculate combined odds from multiple selections
 * Simple multiplication of all odds values
 */
export function calculateCombinedOdds(selections: OddsSelection[]): number {
  if (!selections || selections.length === 0) return 1;
  return selections.reduce((acc, sel) => acc * (sel.odds || 1), 1);
}
