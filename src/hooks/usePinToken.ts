import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface PinToken {
  token: string;
  expiresAt: number;
}

const TOKEN_STORAGE_KEY = 'pin_session_token';

export function usePinToken() {
  const [currentToken, setCurrentToken] = useState<PinToken | null>(null);

  // Load token from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        const token: PinToken = JSON.parse(stored);
        if (token.expiresAt > Date.now()) {
          setCurrentToken(token);
        } else {
          // Token expired, remove it
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch (error) {
        logger.error('usePinToken: Error parsing stored token:', error);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, []);

  // Check if current token is valid
  const isTokenValid = useCallback((): boolean => {
    if (!currentToken) return false;
    return currentToken.expiresAt > Date.now();
  }, [currentToken]);

  // Store a new token
  const storeToken = useCallback((token: string, durationMinutes: number = 15) => {
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
    const pinToken: PinToken = { token, expiresAt };
    
    setCurrentToken(pinToken);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(pinToken));
    
    logger.debug('usePinToken: Token stored, expires in', durationMinutes, 'minutes');
    
    // Auto-clear token when it expires
    setTimeout(() => {
      clearToken();
    }, durationMinutes * 60 * 1000);
  }, []);

  // Clear current token
  const clearToken = useCallback(() => {
    setCurrentToken(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    logger.debug('usePinToken: Token cleared');
  }, []);

  // Get the current valid token
  const getValidToken = useCallback((): string | null => {
    if (isTokenValid()) {
      return currentToken!.token;
    }
    return null;
  }, [currentToken, isTokenValid]);

  // Get remaining time in minutes
  const getRemainingTime = useCallback((): number => {
    if (!currentToken) return 0;
    const remaining = Math.max(0, currentToken.expiresAt - Date.now());
    return Math.ceil(remaining / (1000 * 60));
  }, [currentToken]);

  // Check if PIN is required for an action
  const isPinRequired = useCallback((action: 'payment' | 'settings' | 'sensitive' = 'payment'): boolean => {
    // For now, PIN is always required if not valid token
    // In the future, this could be configurable based on action type
    return !isTokenValid();
  }, [isTokenValid]);

  return {
    hasValidToken: isTokenValid(),
    currentToken: currentToken?.token || null,
    storeToken,
    clearToken,
    getValidToken,
    getRemainingTime,
    isPinRequired,
    expiresAt: currentToken?.expiresAt || null
  };
}