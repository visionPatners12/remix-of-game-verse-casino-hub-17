import type { FeedSelection } from '@/types/selection';
import type { FeedMatch } from '@/types/match';

/**
 * ✅ Centralized helper to prepare selection for AddToTicketButton
 * Eliminates ~20 lines of duplicated transformation logic per component
 */
export function prepareSelectionForTicket(selection: FeedSelection) {
  return {
    conditionId: selection.conditionId,
    outcomeId: selection.outcomeId,
    odds: selection.odds,
    marketType: selection.marketType || '',
    pick: selection.pick || ''
  };
}

/**
 * ✅ Centralized helper to prepare match data for AddToTicketButton
 * Handles various match data formats across the application
 */
export function prepareMatchData(match: FeedMatch | undefined, selection?: FeedSelection) {
  return {
    id: match?.id || selection?.gameId || '',
    gameId: match?.id || selection?.gameId || '',
    home: match?.homeName || selection?.homeTeam || '',
    away: match?.awayName || selection?.awayTeam || '',
    league: match?.league || selection?.league || '',
    participants: selection?.participants || [],
    eventName: selection?.matchName || `${match?.homeName || ''} vs ${match?.awayName || ''}`.trim(),
    matchName: selection?.matchName || ''
  };
}
