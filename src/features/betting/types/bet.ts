export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';
export type BetType = 'single' | 'parlay' | 'system';

export interface BetSelection {
  conditionId: string;
  outcomeId: string;
  marketType: string;
  pick: string;
  odds: number;
  teamNames?: string[];
  matchName?: string;
}

// Database types (raw from Supabase)
export interface BetRow {
  id: string;
  user_id: string;
  match_id?: string;
  amount: number;
  potential_win: number;
  actual_win: number;
  odds: number;
  bet_type: BetType;
  status: BetStatus;
  selections: any; // JSON from database
  condition_id?: string;
  outcome_id?: string;
  azuro_bet_id?: string;
  is_shared: boolean;
  analysis?: string;
  hashtags?: string[];
  bet_code: string;
  currency: string;
  created_at: string;
  updated_at: string;
  settled_at?: string;
}

// Application types (with parsed selections)
export interface Bet {
  id: string;
  user_id: string;
  match_id?: string;
  
  // Bet details
  amount: number;
  potential_win: number;
  actual_win: number;
  odds: number;
  
  // Bet configuration
  bet_type: BetType;
  status: BetStatus;
  
  // Selection details
  selections: BetSelection[];
  
  // Azuro integration
  condition_id?: string;
  outcome_id?: string;
  azuro_bet_id?: string;
  
  // Social sharing
  is_shared: boolean;
  analysis?: string;
  hashtags?: string[];
  
  // Transaction details
  bet_code: string;
  currency: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  settled_at?: string;
}

export interface CreateBetData {
  match_id?: string;
  amount: number;
  potential_win: number;
  odds: number;
  bet_type?: BetType;
  selections: BetSelection[];
  condition_id?: string;
  outcome_id?: string;
  azuro_bet_id?: string;
  is_shared?: boolean;
  analysis?: string;
  hashtags?: string[];
  currency?: string;
}

export interface BetFilters {
  status?: BetStatus;
  bet_type?: BetType;
  date_from?: string;
  date_to?: string;
  is_shared?: boolean;
}