import { useCallback } from 'react';

const PIN_SESSION_KEY = 'pin_session_verified';
const DEFAULT_SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface PinSession {
  verifiedAt: number;
  expiresAt: number;
}

export const usePinSession = () => {
  /**
   * Check if there's a valid (non-expired) PIN session
   */
  const isPinSessionValid = useCallback((): boolean => {
    try {
      const sessionData = sessionStorage.getItem(PIN_SESSION_KEY);
      if (!sessionData) return false;

      const session: PinSession = JSON.parse(sessionData);
      const now = Date.now();

      if (now >= session.expiresAt) {
        // Session expired, clean up
        sessionStorage.removeItem(PIN_SESSION_KEY);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Create a new PIN session after successful verification
   */
  const createPinSession = useCallback((durationMs: number = DEFAULT_SESSION_DURATION_MS): void => {
    const now = Date.now();
    const session: PinSession = {
      verifiedAt: now,
      expiresAt: now + durationMs,
    };
    sessionStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));
  }, []);

  /**
   * Invalidate the current PIN session
   */
  const clearPinSession = useCallback((): void => {
    sessionStorage.removeItem(PIN_SESSION_KEY);
  }, []);

  /**
   * Get remaining session time in seconds
   */
  const getSessionTimeRemaining = useCallback((): number => {
    try {
      const sessionData = sessionStorage.getItem(PIN_SESSION_KEY);
      if (!sessionData) return 0;

      const session: PinSession = JSON.parse(sessionData);
      const remaining = Math.max(0, session.expiresAt - Date.now());
      return Math.floor(remaining / 1000);
    } catch {
      return 0;
    }
  }, []);

  return {
    isPinSessionValid,
    createPinSession,
    clearPinSession,
    getSessionTimeRemaining,
  };
};
