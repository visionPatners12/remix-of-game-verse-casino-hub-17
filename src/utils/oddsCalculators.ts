import { OddsFormat } from '@/types/oddsFormat';

// Convert decimal odds to other formats
export const convertOdds = (decimal: number, format: OddsFormat): string => {
  switch (format) {
    case 'decimal':
      return decimal.toFixed(2);
    
    case 'american':
      if (decimal >= 2.0) {
        return `+${Math.round((decimal - 1) * 100)}`;
      } else {
        return `-${Math.round(100 / (decimal - 1))}`;
      }
    
    case 'fractional':
      const numerator = Math.round((decimal - 1) * 100);
      const denominator = 100;
      const gcd = findGCD(numerator, denominator);
      return `${numerator / gcd}/${denominator / gcd}`;
    
    default:
      return decimal.toFixed(2);
  }
};

// Calculate probability from decimal odds
export const calculateProbability = (decimal: number): number => {
  return (1 / decimal) * 100;
};

// Normalize probabilities to sum to 100%
export const normalizeProbabilities = (probabilities: number[]): number[] => {
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
  if (sum === 0) return probabilities;
  return probabilities.map(prob => (prob / sum) * 100);
};

// Calculate market spread (bid-ask spread)
export const calculateSpread = (forPrice: number, againstPrice: number): number => {
  const forProb = 1 / forPrice;
  const againstProb = 1 / againstPrice;
  const totalImpliedProb = forProb + againstProb;
  return Math.max(0, (totalImpliedProb - 1) * 100);
};

// Format volume with compact notation
export const formatVolume = (volume: number): string => {
  if (volume >= 1_000_000_000) {
    return `$${(volume / 1_000_000_000).toFixed(1)}B`;
  }
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${Math.round(volume)}`;
};

// Format date to ISO string for display
export const formatEndDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// Convert probability to decimal odds
export const probabilityToOdds = (probability: number): number => {
  if (probability <= 0 || probability >= 100) return 1.01;
  return 100 / probability;
};

// Format odds for display (2 decimal places)
export const formatOdds = (odds: number): string => {
  return odds.toFixed(2);
};

// Helper function to find Greatest Common Divisor
function findGCD(a: number, b: number): number {
  return b === 0 ? a : findGCD(b, a % b);
}