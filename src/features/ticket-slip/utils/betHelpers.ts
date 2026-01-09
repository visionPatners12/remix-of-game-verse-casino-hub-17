import type { BetMode } from '../types';

/**
 * Create standardized useBet configuration
 * Centralized to avoid duplication between components
 */
export function createBetConfig({
  stake,
  readyToBet,
  items,
  odds,
  totalOdds,
  onSuccess,
  onError,
}: {
  stake: number;
  readyToBet: boolean;
  items: any[];
  odds: Record<string, number>;
  totalOdds: number;
  onSuccess: () => void;
  onError: (error?: any) => void;
}) {
  return {
    betAmount: readyToBet ? stake.toString() : '0',
    slippage: 10,
    affiliate: '0xE32eB47aaad68dE59A92B8fdE0D0BcC61B7741e3' as `0x${string}`,
    selections: readyToBet ? items.map(item => ({
      conditionId: item.conditionId,
      outcomeId: item.outcomeId,
    })) : [],
    odds: readyToBet ? odds : {},
    totalOdds: readyToBet ? totalOdds : 1,
    onSuccess,
    onError,
  };
}

/**
 * Validate bet submission requirements
 * Centralized validation logic
 */
export function validateBetSubmission(
  selections: any[],
  stake: number,
  isBetAllowed: boolean,
  minBet?: number,
  maxBet?: number
): { isValid: boolean; error?: string } {
  if (selections.length === 0) {
    return { isValid: false, error: 'No selections available' };
  }
  
  if (stake <= 0) {
    return { isValid: false, error: 'Invalid stake amount' };
  }
  
  if (minBet && stake < minBet) {
    return { isValid: false, error: `Minimum bet is ${minBet}` };
  }
  
  if (maxBet && stake > maxBet) {
    return { isValid: false, error: `Maximum bet is ${maxBet}` };
  }
  
  if (!isBetAllowed) {
    return { isValid: false, error: 'Bet not allowed' };
  }
  
  // Validate selections have required fields
  const invalidSelections = selections.filter(sel => !sel.conditionId || !sel.outcomeId);
  if (invalidSelections.length > 0) {
    return { isValid: false, error: 'Invalid selections data' };
  }
  
  return { isValid: true };
}