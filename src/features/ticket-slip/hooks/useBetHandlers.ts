import { useCallback } from 'react';
import { validateBetSubmission } from '../utils/betHelpers';
import type { Selection, BetMode, TicketSlipState } from '../types';

/**
 * Centralized bet handling logic to avoid duplication
 */
export function useBetHandlers({
  baseBetslip,
  detailedBetslip,
  ticketState,
  setTicketState,
  items = [],
  isBetAllowed = false,
}: {
  baseBetslip: any;
  detailedBetslip: any;
  ticketState: TicketSlipState;
  setTicketState: React.Dispatch<React.SetStateAction<TicketSlipState>>;
  items: any[];
  isBetAllowed: boolean;
}) {
  const handleRemoveSelection = useCallback((selectionId: string) => {
    // Parse the selection ID to get conditionId and outcomeId
    const [conditionId, outcomeId] = selectionId.split('-');
    
    if (!conditionId || !outcomeId) {
      return;
    }

    // Find the item in the betslip that matches both conditionId and outcomeId
    const itemToRemove = items.find(item => 
      item.conditionId === conditionId && item.outcomeId === outcomeId
    );

    if (!itemToRemove) {
      return;
    }
    
    if (baseBetslip?.removeItem) {
      baseBetslip.removeItem(itemToRemove);
    }
  }, [baseBetslip, items]);

  const handleClearSelections = useCallback(() => {
    if (baseBetslip?.clear) {
      baseBetslip.clear();
    }
  }, [baseBetslip]);

  const handleStakeChange = useCallback((stake: number) => {
    setTicketState(prev => ({ ...prev, stake }));
    if (detailedBetslip?.changeBetAmount) {
      detailedBetslip.changeBetAmount(stake.toString());
    }
  }, [setTicketState, detailedBetslip]);

  const validateSubmission = useCallback(() => {
    return validateBetSubmission(items, ticketState.stake, isBetAllowed);
  }, [items, ticketState.stake, isBetAllowed]);

  return {
    handleRemoveSelection,
    handleClearSelections,
    handleStakeChange,
    validateSubmission,
  };
}