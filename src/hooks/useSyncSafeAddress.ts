import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedWallet } from './useUnifiedWallet';
import { useAuth } from '@/features/auth';
import { logger } from '@/utils/logger';

/**
 * Hook to synchronize the Safe (Smart Account) address from Azuro SDK to Supabase.
 * 
 * This ensures that the Safe address is stored in users.safe_address for:
 * - ENS generation (correct address)
 * - Deposit display
 * - Withdrawal operations
 * 
 * The hook only syncs when:
 * - User is authenticated
 * - A valid address is available from useUnifiedWallet
 * - The address hasn't been synced yet in this session
 */
export function useSyncSafeAddress() {
  const { address, isAAWallet, privyReady, privyAuthenticated } = useUnifiedWallet();
  const { user, isAuthenticated } = useAuth();
  const hasSynced = useRef(false);
  const lastSyncedAddress = useRef<string | null>(null);

  const syncSafeAddress = useCallback(async () => {
    // Guard conditions
    if (!address || !user?.id || !isAuthenticated) {
      logger.debug('[useSyncSafeAddress] Missing requirements:', { 
        hasAddress: !!address, 
        userId: user?.id, 
        isAuthenticated 
      });
      return;
    }

    // Avoid duplicate syncs for the same address
    if (hasSynced.current && lastSyncedAddress.current === address) {
      logger.debug('[useSyncSafeAddress] Already synced this address');
      return;
    }

    // Wait for Privy to be ready and authenticated
    if (!privyReady || !privyAuthenticated) {
      logger.debug('[useSyncSafeAddress] Waiting for Privy to be ready');
      return;
    }

    try {
      logger.info('[useSyncSafeAddress] Syncing Safe address to database:', { 
        userId: user.id, 
        address, 
        isAAWallet 
      });

      // Update users.safe_address directly from frontend
      const { error } = await supabase
        .from('users')
        .update({ 
          safe_address: address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logger.error('[useSyncSafeAddress] Failed to sync Safe address:', error);
        return;
      }

      hasSynced.current = true;
      lastSyncedAddress.current = address;
      logger.info('[useSyncSafeAddress] Safe address synced successfully:', address);

    } catch (error) {
      logger.error('[useSyncSafeAddress] Error syncing Safe address:', error);
    }
  }, [address, user?.id, isAuthenticated, privyReady, privyAuthenticated, isAAWallet]);

  useEffect(() => {
    syncSafeAddress();
  }, [syncSafeAddress]);

  // Reset sync state on logout/disconnect
  useEffect(() => {
    if (!isAuthenticated || !address) {
      hasSynced.current = false;
      lastSyncedAddress.current = null;
    }
  }, [isAuthenticated, address]);

  return { 
    hasSynced: hasSynced.current,
    syncedAddress: lastSyncedAddress.current,
    // Expose for manual trigger if needed
    triggerSync: syncSafeAddress
  };
}
