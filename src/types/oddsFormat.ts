export type OddsFormat = 'decimal' | 'american' | 'fractional';

export interface MarketSelection {
  marketId: string;
  side: 'FOR' | 'AGAINST';
}

export interface EventDetailCallbacks {
  onSelect?: (selection: MarketSelection) => void;
}

export interface NormalizedMarket {
  id: string;
  question: string;
  outcomes: string[];
  probabilities: [number, number]; // [for, against] normalized to 100%
  prices: [number, number]; // [for, against] as decimals
  volume: number;
  liquidity: number;
  endDate: string;
  spread: number;
  isActive: boolean;
  rulesUrl?: string;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  markets: NormalizedMarket[];
  volume: number;
  liquidity: number;
  endDate: string;
  commentCount?: number;
}