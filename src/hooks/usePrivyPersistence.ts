import { useEffect, useCallback, useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/features/auth';
import { logger } from '@/utils/logger';

export const usePrivyPersistence = () => {
  const { isAuthenticated, userType } = useAuth();
  const { ready, authenticated, login } = usePrivy();
  const [needsReconnection, setNeedsReconnection] = useState(false);
  const [autoReconnectFailed, setAutoReconnectFailed] = useState(false);
  const autoReconnectAttemptedRef = useRef(false);

  // Check if Privy needs reconnection
  const checkPrivySession = useCallback(() => {
    const shouldBeConnected = isAuthenticated && userType === 'privy';
    const privyDisconnected = ready && !authenticated;
    
    if (shouldBeConnected && privyDisconnected) {
      logger.debug('⚠️ Privy session expired - needs reconnection', {
        supabaseAuth: isAuthenticated,
        userType,
        privyReady: ready,
        privyAuthenticated: authenticated
      });
      setNeedsReconnection(true);
    } else {
      setNeedsReconnection(false);
      setAutoReconnectFailed(false);
    }
  }, [isAuthenticated, userType, ready, authenticated]);

  // Detect when Privy session is missing but should be connected
  // Privy's login() opens a modal, so we can't auto-reconnect silently
  // But we can auto-detect and prompt the user immediately
  useEffect(() => {
    if (!ready) return;
    
    const shouldBeConnected = isAuthenticated && userType === 'privy';
    const privyDisconnected = !authenticated;
    
    if (shouldBeConnected && privyDisconnected && !autoReconnectAttemptedRef.current) {
      autoReconnectAttemptedRef.current = true;
      logger.debug('🔄 PWA: Privy session missing, setting reconnection flag');
      setNeedsReconnection(true);
      setAutoReconnectFailed(true); // Show prompt immediately
    } else if (authenticated) {
      // Privy reconnected successfully
      setNeedsReconnection(false);
      setAutoReconnectFailed(false);
      autoReconnectAttemptedRef.current = false;
    }
  }, [ready, isAuthenticated, userType, authenticated]);

  // Check when tab becomes visible
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      logger.debug('Tab visible - checking Privy session');
      checkPrivySession();
    }
  }, [checkPrivySession]);

  // Handle pageshow event - crucial for iOS PWA restoration from bfcache
  const handlePageShow = useCallback((e: PageTransitionEvent) => {
    if (e.persisted) {
      logger.debug('Page restored from bfcache - checking Privy session');
    }
    checkPrivySession();
  }, [checkPrivySession]);

  // Check on storage changes (multi-tab sync)
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key?.startsWith('privy')) {
      logger.debug('Privy storage changed in another tab');
      checkPrivySession();
    }
  }, [checkPrivySession]);

  useEffect(() => {
    checkPrivySession();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    // iOS PWA uses pageshow when restoring the app
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [handleVisibilityChange, handleStorageChange, handlePageShow, checkPrivySession]);

  const reconnectPrivy = useCallback(() => {
    // Privy's login() opens modal - doesn't return a promise
    // The authenticated state change will trigger the effect above
    login();
  }, [login]);

  return {
    needsReconnection,
    reconnectPrivy,
    isPrivyReady: ready,
    isPrivyAuthenticated: authenticated,
    autoReconnectFailed
  };
};
