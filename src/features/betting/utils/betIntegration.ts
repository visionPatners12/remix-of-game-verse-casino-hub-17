import type { Selection } from '@/features/ticket-slip/types';
import type { CreateBetData, BetSelection } from '../types/bet';
import { BetService } from '../services/betService';

/**
 * Convert ticket slip selections to bet selections
 */
export function convertSelectionsToBetSelections(selections: Selection[]): BetSelection[] {
  return selections.map((selection) => ({
    conditionId: selection.conditionId,
    outcomeId: selection.outcomeId,
    marketType: selection.marketType,
    pick: selection.pick,
    odds: selection.customOdds || selection.odds,
    teamNames: selection.participants?.map(p => p.name),
    matchName: selection.eventName
  }));
}

/**
 * Save bet from ticket slip data
 */
export async function saveBetFromTicketSlip({
  selections,
  stake,
  totalOdds,
  potentialWin,
  mode = 'single',
  isShared = false,
  analysis,
  hashtags
}: {
  selections: Selection[];
  stake: number;
  totalOdds: number;
  potentialWin: number;
  mode?: 'single' | 'parlay';
  isShared?: boolean;
  analysis?: string;
  hashtags?: string[];
}) {
  try {
    // Convert selections
    const betSelections = convertSelectionsToBetSelections(selections);
    
    // Get match_id from first selection (for single bets)
    const matchId = selections.length === 1 ? selections[0].gameId : undefined;
    
    // Get Azuro data from first selection
    const firstSelection = selections[0];
    
    const betData: CreateBetData = {
      match_id: matchId,
      amount: stake,
      potential_win: potentialWin,
      odds: totalOdds,
      bet_type: mode === 'parlay' ? 'parlay' : 'single',
      selections: betSelections,
      condition_id: firstSelection?.conditionId,
      outcome_id: firstSelection?.outcomeId,
      is_shared: isShared,
      analysis,
      hashtags,
      currency: 'USDT'
    };

    const result = await BetService.createBet(betData);
    return result;
  } catch (error) {
    console.error('Error saving bet from ticket slip:', error);
    return { data: null, error };
  }
}

/**
 * Update bet status when Azuro bet is settled
 */
export async function updateBetFromAzuroResult(
  azuroBetId: string,
  status: 'won' | 'lost',
  actualWin?: number
) {
  try {
    // Find bet by azuro_bet_id
    const { data: bets } = await BetService.getUserBets();
    const bet = bets?.find(bet => bet.azuro_bet_id === azuroBetId);
    
    if (!bet) {
      console.warn('No bet found for Azuro bet ID:', azuroBetId);
      return { data: null, error: 'Bet not found' };
    }

    return await BetService.updateBetStatus(bet.id, status, actualWin);
  } catch (error) {
    console.error('Error updating bet from Azuro result:', error);
    return { data: null, error };
  }
}