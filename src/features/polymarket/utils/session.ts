// localStorage session management for Polymarket trading

import type { TradingSession } from '../types/trading';
import { logger } from '@/utils/logger';

const SESSION_KEY = 'polymarket_trading_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function saveSession(address: string, session: TradingSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    logger.info('[Session] Saved trading session for', address);
  } catch (error) {
    logger.error('[Session] Failed to save session:', error);
  }
}

export function loadSession(address: string): TradingSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: TradingSession = JSON.parse(raw);

    // Validate session belongs to current address
    const sessionAddress = session.address || session.eoaAddress;
    if (!sessionAddress || sessionAddress.toLowerCase() !== address.toLowerCase()) {
      logger.info('[Session] Session belongs to different address, ignoring');
      return null;
    }

    // Check if session is expired
    const sessionTime = session.timestamp || session.savedAt || 0;
    if (Date.now() - sessionTime > SESSION_MAX_AGE_MS) {
      logger.info('[Session] Session expired, clearing');
      clearSession();
      return null;
    }

    logger.info('[Session] Loaded valid session for', address);
    return session;
  } catch (error) {
    logger.error('[Session] Failed to load session:', error);
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    logger.info('[Session] Cleared trading session');
  } catch (error) {
    logger.error('[Session] Failed to clear session:', error);
  }
}

export function hasValidSession(address: string): boolean {
  const session = loadSession(address);
  return session !== null;
}
