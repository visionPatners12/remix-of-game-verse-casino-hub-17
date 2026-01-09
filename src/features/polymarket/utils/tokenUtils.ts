import { parseOutcomePrices } from './helpers';
import { PolymarketMarket } from '../types/markets';

export function getTokenIdsFromMarket(market: PolymarketMarket): { yes: string; no: string } | null {
  const tokenIds = market.clobTokenIds;
  
  if (Array.isArray(tokenIds) && tokenIds.length >= 2) {
    return {
      yes: tokenIds[0],
      no: tokenIds[1]
    };
  }
  
  return null;
}

export function getMarketPrices(market: PolymarketMarket) {
  const prices = parseOutcomePrices(market.outcomePrices);
  
  return {
    bestBidYes: market.bestBid,
    bestAskYes: market.bestAsk, 
    bestBidNo: undefined, // These would need to be calculated or fetched
    bestAskNo: undefined,
    yesPrice: prices[0] ? parseFloat(prices[0]) : undefined,
    noPrice: prices[1] ? parseFloat(prices[1]) : undefined
  };
}