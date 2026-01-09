import React, { memo } from 'react';
import { Button } from '@/ui';
import { Loader2 } from '@/ui/icons';
import { useAddToTicket } from '@/hooks/useAddToTicket';
import { useSelectionState } from '../../hooks/useSelectionState';
import { cn } from '@/lib/utils';
import type { AddToTicketState } from '../../types';
import type { TicketSelectionInput } from '@/types/selection';
import type { FeedMatch } from '@/types/match';

interface AddToTicketButtonProps {
  selection?: TicketSelectionInput;
  match?: FeedMatch;
  isActive?: boolean;
  className?: string;
  isUpdating?: boolean;
}

/**
 * Unified Add to Ticket button component
 * Eliminates duplication between TipPost and BetPost
 */
export const AddToTicketButton = memo(function AddToTicketButton({
  selection,
  match,
  isActive = true,
  className,
  isUpdating = false
}: AddToTicketButtonProps) {
  const { addToTicket, getButtonState } = useAddToTicket();
  
  // Check condition state
  const { conditionState, canBet, isFetching: isStateFetching } = useSelectionState(selection?.conditionId);

  const buttonState = getButtonState(selection);

  const handleAddToTicket = async () => {
    if (isActive && selection && canBet) {
      await addToTicket({
        selection,
        match,
        marketType: selection.marketType,
        pick: selection.pick
      });
    }
  };

  // Get button text based on condition state
  const getButtonText = () => {
    if (isUpdating) return 'Updating...';
    if (isStateFetching) return 'Checking...';
    if (conditionState === 'Resolved') return 'Resolved';
    if (conditionState === 'Stopped') return 'Suspended';
    if (conditionState === 'Canceled') return 'Canceled';
    if (conditionState === 'Removed') return 'Removed';
    return buttonState.text;
  };

  const isDisabled = buttonState.disabled || !isActive || isUpdating || !canBet || isStateFetching;

  return (
    <Button
      onClick={handleAddToTicket}
      disabled={isDisabled}
      variant={canBet ? buttonState.variant : "secondary"}
      size="sm"
      className={cn(className, !canBet && "opacity-60")}
    >
      {isUpdating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Updating...
        </>
      ) : (
        getButtonText()
      )}
    </Button>
  );
});