/**
 * Shared helpers for feed data transformation
 * DRY: Extracted from multiple locations
 */

import type { StreamSelectionData } from '@/types/stream';

/**
 * Formats a full name from first and last name parts
 * Falls back to username or default
 */
export function formatFullName(
  firstName?: string | null, 
  lastName?: string | null, 
  fallback?: string
): string {
  const full = `${firstName || ''} ${lastName || ''}`.trim();
  return full || fallback || 'User';
}

/**
 * Parses a full name into first and last name parts
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  };
}

/**
 * Normalized selection structure
 */
export interface NormalizedSelection {
  marketType: string;
  pick: string;
  odds: number;
  conditionId?: string;
  outcomeId?: string;
  gameId?: string;
  matchName?: string;
  teamNames?: string;
  league?: string;
  leagueLogo?: string | null;
  sport?: string;
  homeTeam?: string;
  awayTeam?: string;
  participants?: Array<{ name: string; image?: string | null }>;
  startsAt?: string;
}

/**
 * Normalizes a selection from various GetStream formats into a consistent structure
 * DRY: Used by transformPredictions and transformBets
 */
export function normalizeSelection(
  sel: StreamSelectionData, 
  normalizeSport: (sport: unknown) => string,
  normalizeLeague: (league: unknown) => string
): NormalizedSelection {
  return {
    marketType: sel.marketType || sel.market_type || sel.market,
    pick: sel.pick || sel.outcome,
    odds: sel.odds,
    conditionId: sel.conditionId || sel.condition_id,
    outcomeId: sel.outcomeId || sel.outcome_id,
    gameId: sel.gameId || sel.azuroId || sel.azuro_id,
    matchName: sel.matchName || sel.match_name,
    teamNames: sel.teamNames || sel.team_names,
    league: normalizeLeague(sel.league),
    leagueLogo: sel.leagueLogo || null,
    sport: normalizeSport(sel.sport),
    homeTeam: sel.homeTeam || sel.home_team,
    awayTeam: sel.awayTeam || sel.away_team,
    participants: sel.participants || [],
    startsAt: sel.startsAt || sel.starts_at,
  };
}
