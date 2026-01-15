/**
 * Wallet Session Cache - Provides instant wallet state on app load
 * Stores the last known wallet state in localStorage for faster UX
 */

const WALLET_CACHE_KEY = 'wallet_session_cache_v1';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedWalletState {
  address: string;
  chainId: number;
  timestamp: number;
  isAAWallet?: boolean;
}

/**
 * Get cached wallet state from localStorage
 * Returns null if no cache exists or cache is expired
 */
export function getCachedWalletState(): CachedWalletState | null {
  try {
    const cached = localStorage.getItem(WALLET_CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedWalletState = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(WALLET_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

/**
 * Save wallet state to localStorage cache
 */
export function setCachedWalletState(state: Omit<CachedWalletState, 'timestamp'>): void {
  try {
    const data: CachedWalletState = {
      ...state,
      timestamp: Date.now(),
    };
    localStorage.setItem(WALLET_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear the wallet session cache (on logout)
 */
export function clearWalletSessionCache(): void {
  try {
    localStorage.removeItem(WALLET_CACHE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Truncate wallet address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
