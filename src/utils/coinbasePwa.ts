const COINBASE_PENDING_KEY = "coinbase_deposit_pending_v1";

interface CoinbaseDepositPending {
  ts: number;
  amount: string;
  sessionToken: string;
  partnerUserRef?: string;
}

/**
 * Mark a Coinbase deposit as pending before redirecting to Coinbase Pay
 * This allows us to detect when the user returns from the payment flow
 */
export function markCoinbaseDepositPending(data: Omit<CoinbaseDepositPending, 'ts'>): void {
  localStorage.setItem(COINBASE_PENDING_KEY, JSON.stringify({
    ...data,
    ts: Date.now(),
  }));
}

/**
 * Clear the pending deposit state
 */
export function clearCoinbaseDepositPending(): void {
  localStorage.removeItem(COINBASE_PENDING_KEY);
}

/**
 * Get the pending deposit state if it exists and hasn't expired
 * Returns null if no pending deposit or if it expired (30 min timeout)
 */
export function getCoinbaseDepositPending(): CoinbaseDepositPending | null {
  try {
    const raw = localStorage.getItem(COINBASE_PENDING_KEY);
    if (!raw) return null;
    
    const data: CoinbaseDepositPending = JSON.parse(raw);
    
    // Expire après 30 minutes
    const EXPIRY_MS = 30 * 60 * 1000;
    if (Date.now() - data.ts > EXPIRY_MS) {
      clearCoinbaseDepositPending();
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}
