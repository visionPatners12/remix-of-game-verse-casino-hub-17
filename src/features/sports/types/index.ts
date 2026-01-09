// Unified Sports Types - Consolidates sports and match-related interfaces

import { BaseMatchData, BaseTeamData, BaseCardProps, BaseListProps } from '@/types/base';

// Team interface extending base (renamed to avoid conflicts)
export interface SportsTeamInfo extends BaseTeamData {
  country_name?: string;
  country_slug?: string;
}

// GraphQL participant info
export interface ParticipantInfo {
  id?: string; // Optional for GraphQL compatibility
  name: string;
  image?: string;
  slug?: string;
}

// Sport info
export interface SportInfo {
  sportId: string;
  slug: string;
  name: string;
  sporthub?: SportHub;
}

// Sport hub data
export interface SportHub {
  id?: string;
  name?: string;
  slug?: string;
  configuration?: Record<string, unknown>;
}

// Country info
export interface CountryInfo {
  name: string;
  slug: string;
}

// Match interface extending base (compatible with GraphQL Game type)
export interface MatchData {
  id: string;
  gameId: string;
  slug?: string;
  title?: string;
  startsAt?: string;
  state?: string;
  turnover?: string;
  league?: LeagueInfo;
  sport?: SportInfo & { icon_name?: string };
  country?: CountryInfo;
  participants?: ParticipantInfo[];
  result_info?: ResultInfo | string;
  scores?: ScoreData;
  // Legacy/Optional fields for backward compatibility
  team_a?: string;
  team_b?: string;
  status?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  start_time?: string;
  home_team?: SportsTeamInfo;
  away_team?: SportsTeamInfo;
  odds?: MatchOdds;
  markets?: MarketData[];
  [key: string]: unknown; // Index signature for compatibility
}

// League interface
export interface LeagueInfo {
  id: string;
  slug: string;
  name: string;
  image_path?: string;
  azuro_slug?: string; // Slug utilisé par Azuro pour ce league
  activeGamesCount?: number; // Optional for GraphQL compatibility
  country_name?: string;
  country_slug?: string;
}

// Match odds
export interface MatchOdds {
  home: number;
  away: number;
  draw?: number;
}

// Market data
export interface MarketData {
  id: string;
  name: string;
  outcomes: OutcomeData[];
  type: string;
}

// Outcome data
export interface OutcomeData {
  id: string;
  name: string;
  odds: number;
  isActive: boolean;
}

// Component props for sports
export interface MatchCardProps {
  match: MatchData;
  onClick: () => void;
  index?: number;
  viewMode?: 'grid' | 'list' | 'horizontal';
  className?: string;
}

export interface MatchGridProps {
  matches: MatchData[];
  onMatchClick: (matchId: string) => void;
  viewMode?: 'grid' | 'list' | 'horizontal';
  className?: string;
}

export interface LeagueSidebarProps {
  leagues: LeagueInfo[];
  selectedLeagueId: string | null;
  onLeagueSelect: (leagueId: string | null) => void;
  totalMatches: number;
}

// Score data interface
export interface ScoreData {
  home?: number;
  away?: number;
  sets?: {
    home: number[];
    away: number[];
  };
  current_set?: {
    home: number;
    away: number;
  };
  quarter?: {
    q1?: { home: number; away: number };
    q2?: { home: number; away: number };
    q3?: { home: number; away: number };
    q4?: { home: number; away: number };
  };
  total?: {
    home: number;
    away: number;
  };
}

// Result info interface
export interface ResultInfo {
  winner?: string;
  status?: string;
  finished?: boolean;
  goals?: {
    home: number;
    away: number;
  };
  sets_won?: {
    home: number;
    away: number;
  };
}

// Legacy compatibility - re-export with original name
export type TeamInfo = SportsTeamInfo;

// RPC types for new match data structure
export * from './rpc';

// Filter types
export * from './filters';

// Supabase-specific types
export * from './supabase';