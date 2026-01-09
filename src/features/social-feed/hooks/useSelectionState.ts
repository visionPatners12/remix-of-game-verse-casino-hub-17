import { useConditionState } from '@azuro-org/sdk';
import { getConditionStateInfo, isConditionActive } from '@/utils/conditionHelpers';
import { useSelectionResult } from './useSelectionResult';
import { ConditionState } from '@/types';

/**
 * Hook to get the state of a selection condition
 * Returns state info, active status, whether betting is allowed, and result (won/lost)
 */
export function useSelectionState(conditionId?: string, outcomeId?: string) {
  const hasValidId = !!conditionId;
  
  const { data: conditionState, isLocked, isFetching } = useConditionState({
    conditionId: conditionId || '0',
  });
  
  const stateInfo = hasValidId ? getConditionStateInfo(conditionState) : null;
  const isActive = hasValidId ? isConditionActive(conditionState) : false;
  const isResolved = conditionState === ConditionState.Resolved;
  
  // Fetch result only if resolved
  const { isWon, isLost, wonOutcomeIds, isFetchingResult } = useSelectionResult(
    isResolved ? conditionId : undefined,
    outcomeId
  );
  
  return {
    conditionState,
    stateInfo,
    isActive,
    isLocked,
    isFetching: isFetching || isFetchingResult,
    canBet: isActive && !isLocked,
    // Result fields
    isWon,
    isLost,
    isResolved,
    wonOutcomeIds,
  };
}
