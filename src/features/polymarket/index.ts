// Optimized selective exports for better tree-shaking

// UI Components
export { MarketCard } from './components/ui/MarketCard';
export { CircularGauge } from './components/ui/CircularGauge';
export { MarketActionButtons } from './components/ui/MarketActionButtons';
export { PolymarketUnifiedNav } from './components/navigation/PolymarketUnifiedNav';
export { PolymarketCategorySheet } from './components/navigation/PolymarketCategorySheet';
export { PolymarketMobileFeed } from './components/mobile/PolymarketMobileFeed';

// Hooks
export { usePolymarketEvents, usePolymarketEventById, type PolymarketEventWithPrices } from './hooks/queries/usePolymarketEvents';
export { usePolymarketFeed } from './hooks/queries/usePolymarketFeed';
export { useEventDetail } from './hooks/useEventDetail';

// Utils
export { formatVolume, formatPercentage } from './utils/formatters';
export { transformEventToDetail } from './utils/eventTransformers';

// Types
export type { PolymarketEvent } from './types/events';
export type { PolymarketTab, PolymarketFeedResponse, PolymarketSubcategory } from './types/feed';
export type { MarketCardCallbacks } from './types/ui';
export type { PolymarketBetslipItem, ExtendedBetslipItem } from './types/betslip';
export { isPolymarketItem } from './types/betslip';

// Trading/Signing lib
export { buildAndSignYesNoOrder, postSignedOrder, computeExecutablePricesAndOdds, initClobSession } from './lib';
export type { OrderParams, SignedOrder, Side, PostOrderParams, MarketPrices, ExecutablePrices, ClobSession } from './lib';
