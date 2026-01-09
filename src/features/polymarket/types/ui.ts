import { PolymarketEvent, EnrichedPolymarketEvent } from './events';
import { PolymarketMarket } from './markets';

export interface MarketCardCallbacks {
  onView?: (params: { 
    marketId: string; 
    side: 'YES' | 'NO';
    eventTitle: string;
    marketQuestion: string;
    buyPrice?: number;
  }) => void;
  onOpenDetails?: (eventId: string, eventTitle?: string) => void;
}

export interface MarketCardProps extends MarketCardCallbacks {
  event: PolymarketEvent;
  className?: string;
}

export interface TemplateProps {
  event: PolymarketEvent;
  isResolved?: boolean;
  isHovered?: boolean;
  onView?: (params: { 
    marketId: string; 
    side: 'YES' | 'NO'; 
    eventTitle: string;
    marketQuestion: string;
    buyPrice?: number;
  }) => void;
}

export interface MarketRowData {
  id: string;
  label: string;
  percentage: number;
  outcomes: string[];
}

export interface CircularGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export interface ActionButtonsProps {
  marketId: string;
  size: 'small' | 'large';
  onView?: (params: { marketId: string; side: 'YES' | 'NO' }) => void;
  disabled?: boolean;
  yesOdds?: number;
  noOdds?: number;
}

export interface ExtendedActionButtonsProps extends ActionButtonsProps {
  showReadonly?: boolean;
}

export interface MarketFooterProps {
  volume: number;
  periodicity?: string;
}

/**
 * Extended MarketRowData with full market object and pricing info
 */
export interface MarketRowDataWithMarket extends MarketRowData {
  market: PolymarketMarket;
  yesBuyPrice: number;
  noBuyPrice: number;
  isLive: boolean;
  outcomeIndex?: number;
}

/**
 * Template props with enriched event type
 */
export interface EnrichedTemplateProps {
  event: EnrichedPolymarketEvent;
  isResolved?: boolean;
  isHovered?: boolean;
  onView?: (params: { 
    marketId: string; 
    side: 'YES' | 'NO'; 
    eventTitle: string;
    marketQuestion: string;
    buyPrice?: number;
  }) => void;
}