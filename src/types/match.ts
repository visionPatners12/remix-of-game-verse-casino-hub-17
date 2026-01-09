// ============================================
// Centralized Match Types
// Single source of truth for all match-related types
// ============================================

/**
 * Minimal match type for posts and predictions (Zod compatible)
 */
export interface PostMatch {
  id: string;
  date?: string;
  homeName: string;
  awayName: string;
  league: string;
  leagueId?: string;
  homeId?: string;
  awayId?: string;
}

/**
 * Flexible match type for social feed operations
 * Handles various match data formats across the application
 */
export interface FeedMatch {
  id?: string;
  gameId?: string;
  date?: string;
  league?: string | { name: string; slug: string; logo?: string };
  homeId?: string;
  homeName?: string;
  awayId?: string;
  awayName?: string;
  leagueId?: string;
  startsAt?: string | number;
  state?: string;
  turnover?: string;
  eventName?: string;
  matchName?: string;
  participantImages?: string[];
  participants?: Array<{ name: string; image?: string | null }>;
  sport?: string | { name: string; slug: string };
}

/**
 * Match data for ticket operations
 * Used in useAddToTicket hook
 */
export interface TicketMatchData {
  id?: string;
  gameId?: string;
  eventName?: string;
  matchName?: string;
  homeName?: string;
  awayName?: string;
  participantImages?: string[];
  participants?: Array<{ name: string; image?: string | null }>;
  sport?: string | { name: string; slug: string };
  league?: string | { name: string; slug: string };
  startsAt?: string | number;
  date?: string;
}

// Re-export existing detailed match types
export type { MatchData, LeagueInfo, SportInfo } from '@/features/sports/types';
