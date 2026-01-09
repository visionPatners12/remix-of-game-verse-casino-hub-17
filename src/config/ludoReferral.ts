/**
 * Ludo Referral System Configuration
 * Fallback constants used when DB settings are unavailable
 */

export const LUDO_REFERRAL_RATES = {
  N1: 0.015, // 1.5% for direct referrals
  N2: 0.005, // 0.5% for indirect referrals (referral of referral)
} as const;

export const LUDO_REFERRAL_LEVELS = {
  DIRECT: 1,
  INDIRECT: 2,
} as const;

/**
 * Calculate referral commission for a given bet amount and level
 */
export function calculateLudoReferralCommission(
  betAmount: number,
  level: 1 | 2
): number {
  const rate = level === 1 ? LUDO_REFERRAL_RATES.N1 : LUDO_REFERRAL_RATES.N2;
  return betAmount * rate;
}

/**
 * Format commission percentage for display
 */
export function formatCommissionRate(level: 1 | 2): string {
  const rate = level === 1 ? LUDO_REFERRAL_RATES.N1 : LUDO_REFERRAL_RATES.N2;
  return `${(rate * 100).toFixed(1)}%`;
}
