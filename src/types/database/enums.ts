// ============================================
// Database Enums - Type-safe enum definitions
// ============================================

/**
 * Enum for prediction status (sync with social_post.predictions_status)
 */
export type PredictionStatus = 'pending' | 'won' | 'lost' | 'void' | 'cancelled';

/**
 * Enum for bet status (sync with public.bet_status_enum)
 */
export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';

/**
 * Default values
 */
export const DEFAULT_PREDICTION_STATUS: PredictionStatus = 'pending';
export const DEFAULT_BET_STATUS: BetStatus = 'pending';
