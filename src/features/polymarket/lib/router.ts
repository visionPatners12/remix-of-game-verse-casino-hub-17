export interface MarketPrices {
  bestBidYes?: number;
  bestAskYes?: number;
  bestBidNo?: number;
  bestAskNo?: number;
}

export interface ExecutablePrices {
  priceFor: number;
  priceAgainst: number;
  oddsFor?: number;
  oddsAgainst?: number;
}

export function computeExecutablePricesAndOdds({
  bestBidYes, 
  bestAskYes, 
  bestBidNo, 
  bestAskNo,
}: MarketPrices): ExecutablePrices {
  
  // Calcul des prix "synthétiques" via arbitrage
  const bidNo = bestBidNo ?? (bestAskYes != null ? (1 - bestAskYes) : undefined);
  const askNo = bestAskNo ?? (bestBidYes != null ? (1 - bestBidYes) : undefined);
  
  // Prix exécutable POUR (acheter YES) = min(ask YES, 1 - bid NO)
  const priceFor = Math.min(
    bestAskYes ?? Number.POSITIVE_INFINITY,
    bidNo != null ? (1 - bidNo) : Number.POSITIVE_INFINITY
  );
  
  // Prix exécutable CONTRE (acheter NO) = min(ask NO, 1 - bid YES)
  const priceAgainst = Math.min(
    askNo ?? Number.POSITIVE_INFINITY,
    bestBidYes != null ? (1 - bestBidYes) : Number.POSITIVE_INFINITY
  );
  
  // Conversion en cotes décimales
  const oddsFor = isFinite(priceFor) ? 1 / priceFor : undefined;
  const oddsAgainst = isFinite(priceAgainst) ? 1 / priceAgainst : undefined;
  
  return { 
    priceFor: isFinite(priceFor) ? priceFor : 0, 
    priceAgainst: isFinite(priceAgainst) ? priceAgainst : 0, 
    oddsFor, 
    oddsAgainst 
  };
}
