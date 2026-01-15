import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * Hook to detect and recover Privy sessions when Supabase is connected
 * but Privy needs re-authentication.
 * 
 * Uses getAccessToken() to attempt automatic session recovery.
 */
export function usePrivySessionRecovery() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { userType, isAuthenticated: isSupabaseAuth } = useAuth();
  
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [recoverySucceeded, setRecoverySucceeded] = useState(false);

  // Detect if we need to attempt session recovery
  const needsRecovery = useMemo(() => {
    const isPrivyUser = userType === 'privy';
    const supabaseConnected = isSupabaseAuth && isPrivyUser;
    const privyNotReady = !ready || (ready && !authenticated);
    return supabaseConnected && privyNotReady && !recoveryAttempted;
  }, [userType, isSupabaseAuth, ready, authenticated, recoveryAttempted]);

  // Attempt to recover the Privy session with lazy-load delay
  // This prevents blocking the initial render
  useEffect(() => {
    if (!needsRecovery || isRecovering || !ready) return;

    const attemptRecovery = async () => {
      setIsRecovering(true);
      logger.info('[PrivyRecovery] Attempting to recover Privy session...');

      try {
        // getAccessToken() attempts to refresh the token automatically
        const token = await getAccessToken();
        
        if (token) {
          logger.info('[PrivyRecovery] Session recovered successfully');
          setRecoverySucceeded(true);
        } else {
          logger.warn('[PrivyRecovery] No token available, session may be expired');
          setRecoverySucceeded(false);
        }
      } catch (error) {
        logger.error('[PrivyRecovery] Failed to recover session:', error);
        setRecoverySucceeded(false);
      } finally {
        setIsRecovering(false);
        setRecoveryAttempted(true);
      }
    };

    // Delay recovery attempt to not block initial render
    // This allows the UI to show cached state first
    const timeout = setTimeout(attemptRecovery, 300);
    return () => clearTimeout(timeout);
  }, [needsRecovery, ready, isRecovering, getAccessToken]);

  // Computed state for whether Privy needs manual reconnection
  const needsReconnection = useMemo(() => {
    return recoveryAttempted && !recoverySucceeded && !authenticated;
  }, [recoveryAttempted, recoverySucceeded, authenticated]);

  // Reset recovery state when user logs out
  const resetRecovery = useCallback(() => {
    setRecoveryAttempted(false);
    setRecoverySucceeded(false);
  }, []);

  return {
    isRecovering,
    needsRecovery,
    recoveryAttempted,
    recoverySucceeded,
    needsReconnection,
    resetRecovery,
  };
}
