/**
 * PWA WalletConnect State Machine
 * Handles connection state persistence for iOS PWA where the app may be killed and restarted
 */

const WC_PENDING_KEY = "wc_pending_v1";

interface WcPendingState {
  ts: number;
  path: string;
}

/**
 * Mark that a wallet connection is in progress
 * Called before launching the wallet app
 */
export function markWcPending(): void {
  localStorage.setItem(WC_PENDING_KEY, JSON.stringify({
    ts: Date.now(),
    path: location.pathname + location.search + location.hash,
  }));
}

/**
 * Clear the pending connection state
 * Called when connection completes or explicitly cancelled
 */
export function clearWcPending(): void {
  localStorage.removeItem(WC_PENDING_KEY);
}

/**
 * Get the pending connection state if it exists and hasn't expired
 * Returns null if no pending state or if it's older than 5 minutes
 */
export function getWcPending(): WcPendingState | null {
  try {
    const raw = localStorage.getItem(WC_PENDING_KEY);
    if (!raw) return null;
    
    const data: WcPendingState = JSON.parse(raw);
    
    // Expire after 5 minutes - connection attempt is stale
    const EXPIRY_MS = 5 * 60 * 1000;
    if (Date.now() - data.ts > EXPIRY_MS) {
      clearWcPending();
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

/**
 * Detect if the app is running as an installed PWA
 * Important for iOS where PWA behavior differs significantly
 */
export function isPWA(): boolean {
  // Check for standalone display mode (Android PWA, desktop PWA)
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  
  // Check for iOS standalone mode (Safari "Add to Home Screen")
  const iosStandalone = (navigator as any).standalone === true;
  
  return !!(standalone || iosStandalone);
}

/**
 * Check if we're on iOS (useful for PWA-specific workarounds)
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}
