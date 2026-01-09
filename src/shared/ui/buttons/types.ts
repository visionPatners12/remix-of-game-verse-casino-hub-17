// ===== SHARED ODDS BUTTON TYPES =====

import type { MarketOutcome } from '@azuro-org/toolkit';
import type { MarketSelection, OddsFormat } from '@/types/oddsFormat';
import type { PolymarketEvent, PolymarketMarket } from '@/features/polymarket/types';

// Base odds button variant types
export type OddsVariant = 'sport' | 'prediction' | 'custom';
export type TeamType = 'home' | 'away' | 'draw';
export type MarketSide = 'FOR' | 'AGAINST' | 'YES' | 'NO';
export type PolymarketSide = 'YES' | 'NO';
export type AnimationType = 'up' | 'down' | null;

// Base odds button props
export interface BaseOddsButtonProps {
  variant: OddsVariant;
  label: string;
  odds: number;
  disabled?: boolean;
  className?: string;
  isSelected?: boolean;
  isFetching?: boolean;
  animation?: AnimationType;
  format?: OddsFormat;
}

// Sport variant specific props (for Azuro/sports betting)
export interface SportOddsButtonProps extends BaseOddsButtonProps {
  variant: 'sport';
  outcome: MarketOutcome;
  teamType: TeamType;
  onSelect: (outcome: MarketOutcome) => void;
  gameId?: string;
  eventName?: string;
  marketType?: string;
  participants?: Array<{ name: string; image?: string | null }>;
  sport?: { name: string; slug: string };
  league?: { name: string; slug: string; logo?: string };
  startsAt?: string;
  realTimeOdds?: boolean;
}

// Prediction variant specific props (for Polymarket)
export interface PredictionOddsButtonProps extends BaseOddsButtonProps {
  variant: 'prediction';
  marketId: string;
  side: PolymarketSide;
  onSelect?: (selection: { marketId: string; side: PolymarketSide }) => void;
  event?: PolymarketEvent;
  market?: PolymarketMarket;
  tokenId?: string;
  bestBid?: number;
  bestAsk?: number;
}

// Custom variant for manual odds modification
export interface CustomOddsButtonProps extends BaseOddsButtonProps {
  variant: 'custom';
  originalOdds: number;
  customOdds?: number;
  onChange: (odds: number) => void;
  showModifier?: boolean;
  minOdds?: number;
  maxOdds?: number;
}

// Union type for all odds button props
export type OddsButtonProps = SportOddsButtonProps | PredictionOddsButtonProps | CustomOddsButtonProps;

// Hook return types
export interface OddsDisplayHook {
  formattedOdds: string;
  displayOdds: number;
  probabilityPercent: number;
}

export interface OddsAnimationHook {
  animation: AnimationType;
  previousOdds: number | null;
  triggerAnimation: (currentOdds: number) => void;
}

export interface OddsSelectionHook {
  isSelected: boolean;
  isInBetslip: boolean;
  addToBetslip: (data: any) => void;
  removeFromBetslip: (data: any) => void;
}