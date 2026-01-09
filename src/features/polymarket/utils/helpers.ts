import { PolymarketEvent } from '../types/events';
import { PolymarketMarket } from '../types/markets';

// Cache for parsed outcomes to avoid repeated JSON.parse
const parseCache = new Map<string, string[]>();

export interface ParsedOutcomes {
  outcomes: string[];
  prices: string[];
}

// Parse outcomes - handles string JSON, array, or invalid value
export const parseOutcomes = (outcomesInput: string | string[] | null | undefined): string[] => {
  // If already an array, return it directly
  if (Array.isArray(outcomesInput)) {
    return outcomesInput;
  }
  
  // If null/undefined, return fallback
  if (!outcomesInput) {
    return ['Yes', 'No'];
  }
  
  // If it's a string, try to parse
  if (typeof outcomesInput === 'string') {
    if (parseCache.has(outcomesInput)) {
      return parseCache.get(outcomesInput)!;
    }
    
    try {
      const result = JSON.parse(outcomesInput);
      if (Array.isArray(result)) {
        parseCache.set(outcomesInput, result);
        return result;
      }
    } catch {
      // Parsing failed
    }
  }
  
  return ['Yes', 'No'];
};

// Parse prices - handles string JSON, array, or invalid value
export const parseOutcomePrices = (pricesInput: string | string[] | null | undefined): string[] => {
  // If already an array, return it directly
  if (Array.isArray(pricesInput)) {
    return pricesInput;
  }
  
  // If null/undefined, return fallback
  if (!pricesInput) {
    return ['0.5', '0.5'];
  }
  
  // If it's a string, try to parse
  if (typeof pricesInput === 'string') {
    if (parseCache.has(pricesInput)) {
      return parseCache.get(pricesInput)!;
    }
    
    try {
      const result = JSON.parse(pricesInput);
      if (Array.isArray(result)) {
        parseCache.set(pricesInput, result);
        return result;
      }
    } catch {
      // Parsing failed
    }
  }
  
  return ['0.5', '0.5'];
};

// Check if market is binary (Yes/No)
export const isBinaryMarket = (outcomes: string[]): boolean => {
  return outcomes.length === 2 && 
         outcomes.includes('Yes') && 
         outcomes.includes('No');
};

// This function moved to formatters.ts to avoid conflicts

// Get label for market row in Template A
export const getMarketLabel = (market: PolymarketMarket): string => {
  // Use groupItemTitle if available, otherwise extract meaningful part from question
  if (market.groupItemTitle) {
    return market.groupItemTitle;
  }
  
  // Extract meaningful part from question (before the ?)
  const question = market.question;
  if (question.includes('?')) {
    return question.split('?')[0];
  }
  
  return question;
};

// Determine which template to use
export const determineTemplate = (event: PolymarketEvent): 'A' | 'B' => {
  const { markets } = event;
  
  if (markets.length === 1) {
    const outcomes = parseOutcomes(markets[0].outcomes);
    // Single market with more than 2 outcomes → Template A
    if (outcomes.length > 2) {
      return 'A';
    }
  } else if (markets.length > 1) {
    // Multiple markets, check if all are binary
    const allBinary = markets.every(market => {
      const outcomes = parseOutcomes(market.outcomes);
      return isBinaryMarket(outcomes);
    });
    
    if (allBinary) {
      return 'A'; // Multi-markets binary → Template A
    }
  }
  
  // Default case (single binary market) → Template B
  return 'B';
};

// Get primary market for Template B
export const getPrimaryMarket = (event: PolymarketEvent): PolymarketMarket => {
  return event.markets[0];
};

// Get Yes percentage for binary market
export const getYesPercentage = (market: PolymarketMarket): number => {
  const prices = parseOutcomePrices(market.outcomePrices);
  
  if (prices.length >= 1 && prices[0]) {
    const parsed = parseFloat(prices[0]);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Math.min(100, Math.max(0, parsed * 100));
    }
  }
  
  // Fallback to lastTradePrice if available
  if (market.lastTradePrice && !isNaN(market.lastTradePrice)) {
    return Math.min(100, Math.max(0, market.lastTradePrice * 100));
  }
  
  return 50; // Default fallback
};