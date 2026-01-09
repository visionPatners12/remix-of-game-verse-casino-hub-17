/**
 * Utility functions for formatting odds display
 */

/**
 * Format odds for display based on magnitude
 * - < 10: "1.50", "2.35" (2 decimals)
 * - < 100: "15.5", "99.0" (1 decimal)
 * - < 1000: "125", "999" (no decimals)
 * - >= 1000: "1.2k", "5.6k" (compact)
 */
export function formatOdds(odds: number): string {
  if (!isFinite(odds) || isNaN(odds) || odds <= 0) return '—';
  
  if (odds < 10) {
    return odds.toFixed(2);
  } else if (odds < 100) {
    return odds.toFixed(1);
  } else if (odds < 1000) {
    return odds.toFixed(0);
  } else if (odds < 10000) {
    return (odds / 1000).toFixed(1) + 'k';
  } else {
    return (odds / 1000).toFixed(0) + 'k';
  }
}

/**
 * Check if odds are extreme (indicating low liquidity)
 */
export function isExtremeOdds(odds: number): boolean {
  return isFinite(odds) && odds >= 100;
}

/**
 * Calculate odds from price (0-1 range)
 */
export function priceToOdds(price: number): number {
  if (!isFinite(price) || price <= 0 || price >= 1) return 0;
  return 1 / price;
}
