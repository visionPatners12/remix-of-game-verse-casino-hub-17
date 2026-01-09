// ===== POLYMARKET BETSLIP TYPES =====

/**
 * Extended betslip item for Polymarket predictions
 */
export interface PolymarketBetslipItem {
  polymarketId: string;
  marketId: string;
  side: 'YES' | 'NO';
  eventTitle?: string;
  marketQuestion?: string;
  odds?: number;
}

/**
 * Type guard to check if a betslip item is a Polymarket item
 */
export function isPolymarketItem(item: unknown): item is PolymarketBetslipItem {
  return (
    typeof item === 'object' && 
    item !== null && 
    'polymarketId' in item &&
    typeof (item as PolymarketBetslipItem).polymarketId === 'string'
  );
}

/**
 * Union type for all betslip item types
 * Uses global AzuroSDK.BetslipItem from @azuro-org/sdk
 */
export type ExtendedBetslipItem = AzuroSDK.BetslipItem | PolymarketBetslipItem;
