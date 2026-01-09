// ============================================
// Centralized Selection Types
// Single source of truth for all selection-related types
// ============================================

import type { Selection as AzuroSelection } from '@azuro-org/toolkit';

/**
 * Base selection for Azuro SDK betting operations
 * Minimum required fields for placing a bet
 */
export interface AzuroBettingSelection {
  conditionId: string;
  outcomeId: string;
}

/**
 * Selection with display data for UI rendering
 * Extends base betting selection with odds and market info
 */
export interface DisplaySelection extends AzuroBettingSelection {
  odds: number;
  marketType: string;
  pick: string;
}

/**
 * Selection for social feed posts with match context
 * Used in TipPostCard, BetPostCard, SelectionWithState, etc.
 */
export interface FeedSelection extends DisplaySelection {
  matchName?: string;
  homeTeam?: string;
  awayTeam?: string;
  league?: string;
  leagueLogo?: string;
  gameId?: string;
  sport?: string | { slug: string; name: string };
  participants?: Array<{ name: string; image?: string | null }>;
  startsAt?: string;
}

/**
 * Selection input for odds calculations
 * Minimal type for useCombinedOdds and useLiveCombinedOdds
 */
export interface OddsSelection {
  conditionId?: string;
  outcomeId?: string;
  odds: number;
}

/**
 * Selection input for ticket operations
 * Used in useAddToTicket hook
 */
export interface TicketSelectionInput {
  conditionId: string;
  outcomeId: string;
  odds: number;
  marketType?: string;
  pick?: string;
}

// Re-export the full ticket-slip Selection type
export type { Selection as TicketSelection } from '@/features/ticket-slip/types';
