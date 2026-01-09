import { useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { usePrivy } from '@privy-io/react-auth';
import { logger } from '@/utils/logger';

export const useAuthPersistence = () => {
  const { refreshSession, user, session, userType } = useAuth();
  const { ready: privyReady, authenticated: privyAuthenticated } = usePrivy();
  
  // Memoize user ID to reduce effect re-runs
  const userId = useMemo(() => user?.id, [user?.id]);

  // Check session when tab becomes visible
  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible') {
      logger.debug('Tab became visible, checking session validity');
      
      // Check Supabase session
      if (userId) {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            logger.error('Session check error:', error);
            return;
          }
          
          if (!currentSession && userId) {
            logger.debug('Session expired, attempting refresh');
            await refreshSession();
          }
        } catch (error) {
          logger.error('Error checking session:', error);
        }
      }
      
      // Check Privy session for wallet users
      if (userType === 'privy' && privyReady && !privyAuthenticated) {
        logger.debug('⚠️ Privy session needs reconnection');
      }
    }
  }, [userId, refreshSession, userType, privyReady, privyAuthenticated]);

  // Sync auth state between tabs
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key?.startsWith('supabase.auth.') && e.newValue !== e.oldValue) {
      logger.debug('Auth state changed in another tab');
      refreshSession().catch(logger.error);
    }
  }, [refreshSession]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleVisibilityChange, handleStorageChange]);
};
