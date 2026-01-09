/**
 * Centralized types for the Ludo feature
 * Single source of truth for all Ludo-related type definitions
 */

import type { Positions, Color } from '../model/ludoModel';

// Re-export Color and Positions from ludoModel
export type { Positions, Color };

/**
 * Game data from ludo_games table
 */
export interface GameData {
  id: string;
  game_name: string;
  room_code: string;
  status: 'created' | 'active' | 'finished' | 'abandoned';
  max_players: number;
  current_players: number;
  created_at: string;
  started_at?: string;
  created_by: string;
  turn: Color;
  dice: number | null;
  extra_turn_on_six: boolean;
  bet_amount: number;
  positions: Positions;
  winner?: Color;
  winner_user_id?: string;
  pot?: number;
  claim_status?: string;
  claim_tx_hash?: string;
  turn_started_at?: string;
}

/**
 * Player data from ludo_game_players table
 */
export interface PlayerData {
  id: string;
  user_id: string;
  color: Color;
  position: number;
  is_ready: boolean;
  is_connected: boolean;
  turn_order: number;
  last_seen_at: string;
  tx_hash?: string;
  deposit_status?: string;
  has_exited?: boolean;
}

/**
 * Player with additional user info (username, avatar, etc.)
 */
export interface PlayerWithUserInfo extends PlayerData {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

/**
 * UI Move representation for highlighting possible moves
 */
export interface UIMove {
  pawnIndex: number;
  from: 'prison' | 'home' | 'track';
  canExit: boolean;  // true if exit from prison/home with 6
  target: number | null;  // track/safe/goal index for UI highlight
}

/**
 * Winner information for the result modal
 */
export interface WinnerInfo {
  color: Color;
  name: string;
  avatar?: string;
  isMe: boolean;
  potAmount?: number;
}

/**
 * Animating pawn state for movement animations
 */
export interface AnimatingPawn {
  playerId: string;
  pawnIndex: number;
  color: Color;
  path: number[];
  currentStep: number;
  isComplete: boolean;
}

/**
 * API Response types for ludo-game edge function
 */
export interface LudoApiResponse {
  ok: boolean;
  error?: string;
  code?: 'FORBIDDEN' | 'BAD_STATE' | 'INVALID_MOVE' | 'NOT_FOUND';
}

export interface RollResponse extends LudoApiResponse {
  diceValue?: number;
  finished?: boolean;
  winner?: Color;
}

export interface MoveResponse extends LudoApiResponse {
  moveResult?: {
    valid: boolean;
    newPosition?: number;
    capturedPawn?: {
      color: Color;
      pawnIndex: number;
    };
  };
  finished?: boolean;
  winner?: Color;
}

export interface SkipResponse extends LudoApiResponse {
  action?: 'skipped';
  finished?: boolean;
  winner?: Color;
}

export interface AutoPlayResponse extends LudoApiResponse {
  action?: 'auto_played' | 'auto_no_move' | 'aborted_or_finished';
  winner?: Color;
}

export interface StartResponse extends LudoApiResponse {
  started?: boolean;
}

export interface ExitResponse extends LudoApiResponse {
  exited?: boolean;
}

/**
 * Turn validation result
 */
export interface TurnValidationResult {
  isValid: boolean;
  reason?: string;
  canRetry?: boolean;
}

/**
 * Dice roller props
 */
export interface DiceRollerProps {
  gameId: string;
  currentTurn: string;
  currentPlayerColor?: string;
  isPlayerTurn: boolean;
  diceValue: number | null;
  isGameActive: boolean;
  onDiceRolled?: (diceValue: number) => void;
  triggerRoll?: number;
}
