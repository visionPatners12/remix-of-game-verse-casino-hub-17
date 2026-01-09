import { useState, useCallback, useRef } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useWalletDeepLink } from './useWalletDeepLink';
import { useToast } from '@/hooks/use-toast';

const WALLET_TIMEOUT_MS = 60000; // 60 seconds timeout

/**
 * Hook to manage wallet transaction state and auto-open external wallets
 * on mobile devices for transaction confirmation.
 * Includes a 60-second timeout to prevent UI blocking.
 */
export function useWalletTransaction() {
  const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);
  const { wallets } = useWallets();
  const { openWallet, hasWallet } = useWalletDeepLink();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on a mobile device
  const isMobile = typeof navigator !== 'undefined' && 
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check if the wallet is an external wallet (not embedded Privy)
  const wallet = wallets[0];
  const isExternalWallet = wallet && wallet.walletClientType !== 'privy';
  
  // Should we attempt to open the wallet app?
  const shouldOpenWallet = isMobile && hasWallet && isExternalWallet;

  /**
   * Clear any existing timeout
   */
  const clearTransactionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Wraps an async transaction function with wallet state management.
   * Automatically opens the wallet app on mobile for external wallets.
   * Includes a 60-second timeout to prevent UI blocking.
   */
  const startTransaction = useCallback(async (
    submitFn: () => Promise<void>
  ) => {
    setIsWaitingForWallet(true);
    clearTransactionTimeout();
    
    // Set up timeout to prevent infinite waiting
    timeoutRef.current = setTimeout(() => {
      setIsWaitingForWallet(false);
      toast({
        title: "Transaction timeout",
        description: "The wallet did not respond in time. Please try again.",
        variant: "destructive",
      });
    }, WALLET_TIMEOUT_MS);
    
    try {
      // Trigger the transaction
      await submitFn();
      
      // On mobile with external wallet, open the wallet app
      if (shouldOpenWallet) {
        // Small delay to ensure transaction is broadcasted
        setTimeout(() => {
          openWallet();
        }, 500);
      }
    } catch (error) {
      clearTransactionTimeout();
      setIsWaitingForWallet(false);
      throw error;
    }
  }, [shouldOpenWallet, openWallet, clearTransactionTimeout, toast]);

  /**
   * Call this when the transaction completes (success or error)
   */
  const endTransaction = useCallback(() => {
    clearTransactionTimeout();
    setIsWaitingForWallet(false);
  }, [clearTransactionTimeout]);

  return {
    isWaitingForWallet,
    startTransaction,
    endTransaction,
    walletType: wallet?.walletClientType,
    isMobile,
    isExternalWallet,
    shouldOpenWallet,
  };
}
