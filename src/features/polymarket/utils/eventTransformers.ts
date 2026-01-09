import { PolymarketEvent } from '../types/events';
import { EventDetail, NormalizedMarket } from '@/types/oddsFormat';
import { parseOutcomes, parseOutcomePrices } from './helpers';
import { calculateProbability, normalizeProbabilities, calculateSpread } from '@/utils/oddsCalculators';

// Cache for transformation results to avoid re-computation
const transformCache = new Map<string, EventDetail>();
const marketTransformCache = new Map<string, NormalizedMarket>();

export const transformEventToDetail = (event: PolymarketEvent): EventDetail => {
  // Safety check for missing markets array
  const markets = event.markets ?? [];
  
  // Check cache first
  const cacheKey = `${event.id}-${markets.length}-${event.volume}`;
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey)!;
  }

  // Sort markets by liquidity before transforming (memoized)
  const sortedMarkets = [...markets].sort((a, b) => (Number(b.liquidity) || 0) - (Number(a.liquidity) || 0));
  
  const normalizedMarkets: NormalizedMarket[] = sortedMarkets.map(market => {
    // Check market cache
    const marketCacheKey = `${market.id}-${market.outcomes}-${market.outcomePrices}`;
    if (marketTransformCache.has(marketCacheKey)) {
      return marketTransformCache.get(marketCacheKey)!;
    }

    const outcomes = parseOutcomes(market.outcomes);
    const prices = parseOutcomePrices(market.outcomePrices);
    
    // Extract FOR/AGAINST prices (assuming binary markets)
    let forPrice = 1.5; // Default fallback
    let againstPrice = 1.5; // Default fallback
    
    if (prices.length >= 2) {
      // Convert from probability to decimal odds
      const forProb = parseFloat(prices[0]);
      const againstProb = parseFloat(prices[1]);
      
      forPrice = forProb > 0 ? 1 / forProb : 1.5;
      againstPrice = againstProb > 0 ? 1 / againstProb : 1.5;
    }
    
    // Calculate raw probabilities
    const forProbRaw = calculateProbability(forPrice);
    const againstProbRaw = calculateProbability(againstPrice);
    
    // Normalize probabilities to sum to 100%
    const [forProb, againstProb] = normalizeProbabilities([forProbRaw, againstProbRaw]);
    
    // Calculate spread
    const spread = calculateSpread(forPrice, againstPrice);
    
    const normalizedMarket = {
      id: market.id,
      question: market.question,
      outcomes: outcomes.length >= 2 ? outcomes : ['Oui', 'Non'],
      probabilities: [forProb, againstProb] as [number, number],
      prices: [forPrice, againstPrice] as [number, number],
      volume: Number(market.volume) || 0,
      liquidity: Number(market.liquidity) || 0,
      endDate: market.endDate || event.endDate,
      spread: spread,
      isActive: market.active && !market.closed,
      rulesUrl: market.resolutionSource || undefined
    };

    // Cache the normalized market
    marketTransformCache.set(marketCacheKey, normalizedMarket);
    return normalizedMarket;
  });
  
  const result = {
    id: event.id,
    title: event.title,
    description: event.description || '',
    imageUrl: event.image || undefined,
    markets: normalizedMarkets,
    volume: Number(event.volume) || 0,
    liquidity: Number(event.liquidity) || 0,
    endDate: event.endDate,
    commentCount: event.commentCount || 0
  };

  // Cache the result
  transformCache.set(cacheKey, result);
  return result;
};
