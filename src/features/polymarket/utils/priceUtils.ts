import { PolymarketMarket } from '../types/markets';
import { parseOutcomePrices } from './helpers';

export interface ClobPrices {
  yesBuyPrice: number;
  noBuyPrice: number;
  isLive: boolean; // True if using real CLOB prices
  isInvalid?: boolean; // True if prices are not valid
}

/**
 * Parse token IDs from market clobTokenIds (now an array)
 */
export function parseTokenIds(clobTokenIds: string[] | undefined): string[] {
  if (!clobTokenIds) return [];
  return Array.isArray(clobTokenIds) ? clobTokenIds : [];
}

/**
 * Extract accurate buy prices from CLOB data
 * 
 * CLOB prices format: { "tokenId:BUY": price, "tokenId:SELL": price }
 * - BUY side = best ask (what you pay to buy)
 * - SELL side = best bid (what you get when selling)
 * 
 * For YES: buyPrice = clobPrices[yesTokenId:BUY]
 * For NO: buyPrice = 1 - clobPrices[yesTokenId:SELL] (synthetic)
 */
export function getClobPrices(
  market: PolymarketMarket,
  clobPrices: Record<string, string | number> | null
): ClobPrices {
  // Parse token IDs from market
  const tokenIds = parseTokenIds(market.clobTokenIds);
  const yesTokenId = tokenIds[0];
  
  // Try to get CLOB prices first
  if (clobPrices && yesTokenId) {
    const yesAskPrice = clobPrices[`${yesTokenId}:BUY`];  // Best ask for YES
    const yesBidPrice = clobPrices[`${yesTokenId}:SELL`]; // Best bid for YES
    
    if (yesAskPrice !== undefined) {
      const yesBuyPrice = typeof yesAskPrice === 'string' ? parseFloat(yesAskPrice) : yesAskPrice;
      
      // NO buy price = 1 - YES bid (synthetic price)
      let noBuyPrice: number;
      if (yesBidPrice !== undefined) {
        const yesBid = typeof yesBidPrice === 'string' ? parseFloat(yesBidPrice) : yesBidPrice;
        noBuyPrice = 1 - yesBid;
      } else {
        // Fallback: use spread approximation
        noBuyPrice = 1 - yesBuyPrice + 0.02; // ~2% spread
      }
      
      return {
        yesBuyPrice: Math.max(0.01, Math.min(0.99, yesBuyPrice)),
        noBuyPrice: Math.max(0.01, Math.min(0.99, noBuyPrice)),
        isLive: true
      };
    }
  }
  
  // Fallback 1: Use market.bestAsk/bestBid from Gamma API
  if (market.bestAsk && market.bestAsk > 0) {
    const yesBuyPrice = market.bestAsk;
    const noBuyPrice = market.bestBid ? (1 - market.bestBid) : (1 - yesBuyPrice + 0.02);
    
    return {
      yesBuyPrice: Math.max(0.01, Math.min(0.99, yesBuyPrice)),
      noBuyPrice: Math.max(0.01, Math.min(0.99, noBuyPrice)),
      isLive: false
    };
  }
  
  // Fallback 2: Use outcomePrices (mid price)
  const prices = parseOutcomePrices(market.outcomePrices);
  const yesMidPrice = prices[0] ? parseFloat(prices[0]) : 0.5;
  const noMidPrice = prices[1] ? parseFloat(prices[1]) : 0.5;
  
  return {
    yesBuyPrice: Math.max(0.01, Math.min(0.99, yesMidPrice)),
    noBuyPrice: Math.max(0.01, Math.min(0.99, noMidPrice)),
    isLive: false
  };
}
