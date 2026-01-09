import { DEFAULT_CASINO_COMMISSION_RATE } from '@/config/casino';

/**
 * Hook to get the casino commission rate.
 * Currently returns the default value (10%).
 * Can be extended to fetch from backend if needed.
 */
export function useCasinoCommission() {
  const commissionRate = DEFAULT_CASINO_COMMISSION_RATE;

  return {
    commissionRate,
    commissionDecimal: commissionRate / 100,
    commissionPercent: commissionRate,
    isLoading: false,
    error: null,
  };
}
