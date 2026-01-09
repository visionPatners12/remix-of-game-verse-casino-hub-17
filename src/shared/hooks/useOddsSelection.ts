// ===== ODDS SELECTION HOOK =====

import { useMemo, useCallback } from 'react';
import { useBaseBetslip } from '@azuro-org/sdk';
import type { MarketOutcome } from '@azuro-org/toolkit';
import type { OddsSelectionHook } from '@/shared/ui/buttons/types';
import { isPolymarketItem } from '@/features/polymarket';

interface UseOddsSelectionOptions {
  variant: 'sport' | 'prediction';
  // For sport variant
  outcome?: MarketOutcome;
  gameId?: string;
  eventName?: string;
  marketType?: string;
  participants?: Array<{ name: string; image?: string | null }>;
  sport?: { name: string; slug: string };
  league?: { name: string; slug: string; logo?: string };
  startsAt?: string;
  // For prediction variant  
  marketId?: string;
  side?: string;
}

export function useOddsSelection(options: UseOddsSelectionOptions): OddsSelectionHook {
  const baseBetslip = useBaseBetslip();
  const { items = [], addItem = () => {}, removeItem = () => {} } = baseBetslip || {};

  // Check if current selection is in betslip
  const isInBetslip = useMemo(() => {
    if (options.variant === 'sport' && options.outcome) {
      return items.some(
        item => item.conditionId === options.outcome!.conditionId && 
                item.outcomeId === options.outcome!.outcomeId
      );
    }
    
    // For prediction markets, use type guard for Polymarket items
    if (options.variant === 'prediction' && options.marketId && options.side) {
      return items.some(
        item => isPolymarketItem(item) && item.polymarketId === `${options.marketId}-${options.side}`
      );
    }
    
    return false;
  }, [items, options]);

  // Add to betslip
  const addToBetslip = useCallback((customData?: any) => {
    if (options.variant === 'sport' && options.outcome) {
      const selectionData = {
        conditionId: options.outcome.conditionId,
        outcomeId: options.outcome.outcomeId,
        gameId: options.gameId || '',
        isExpressForbidden: false,
        eventName: options.eventName || '',
        marketType: options.marketType || '',
        pick: options.outcome.selectionName || '',
        odds: options.outcome.odds || 0,
        participantImages: options.participants?.map(p => p.image).filter((img): img is string => !!img),
        participants: options.participants,
        sport: options.sport,
        league: options.league,
        startsAt: options.startsAt,
        ...customData
      };
      addItem(selectionData);
    }
    
    if (options.variant === 'prediction' && options.marketId && options.side) {
      const selectionData = {
        polymarketId: `${options.marketId}-${options.side}`,
        marketId: options.marketId,
        side: options.side,
        ...customData
      };
      addItem(selectionData);
    }
  }, [options, addItem]);

  // Remove from betslip
  const removeFromBetslip = useCallback((customData?: any) => {
    if (options.variant === 'sport' && options.outcome) {
      const itemToRemove = items.find(
        item => item.conditionId === options.outcome!.conditionId && 
                item.outcomeId === options.outcome!.outcomeId
      );
      if (itemToRemove) {
        removeItem(itemToRemove);
      }
    }
    
    if (options.variant === 'prediction' && options.marketId && options.side) {
      const itemToRemove = items.find(
        item => isPolymarketItem(item) && item.polymarketId === `${options.marketId}-${options.side}`
      );
      if (itemToRemove) {
        removeItem(itemToRemove);
      }
    }
  }, [options, items, removeItem]);

  return {
    isSelected: isInBetslip,
    isInBetslip,
    addToBetslip,
    removeFromBetslip
  };
}