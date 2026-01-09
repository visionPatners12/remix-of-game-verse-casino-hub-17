import { useMemo } from 'react';
import { useConnect, useDisconnect, useWalletClient, useSwitchChain } from 'wagmi';
import { useAccount } from '@azuro-org/sdk-social-aa-connector';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAuth } from '@/hooks/useAuth';
import { usePrivySessionRecovery } from '@/hooks/usePrivySessionRecovery';
import { logger } from '@/utils/logger';

/**
 * Unified wallet hook that combines all wallet functionality
 * Replaces useRealWallet, useSimpleWallet, and eliminates wallet confusion
 * 
 * Now includes Privy session recovery to handle cases where Supabase
 * is connected but Privy needs re-authentication.
 * 
 * Supports both external wallets AND Privy embedded wallets (for email/social login).
 */
export function useUnifiedWallet() {
  const { userType } = useAuth();
  
  // Azuro SDK account (may have AA wallet address)
  const { address: azuroAddress, isConnected: azuroConnected, isConnecting, chainId, isAAWallet } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets(); // Get ALL wallets (embedded + external)
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Session recovery hook
  const { 
    isRecovering, 
    needsReconnection,
    recoveryAttempted 
  } = usePrivySessionRecovery();

  // Find the best available wallet address
  // Priority: 1) Azuro AA wallet, 2) Privy embedded wallet, 3) External wallet
  const getActiveWalletAddress = (): string | null => {
    // If Azuro SDK has an address (could be AA or external), use it
    if (azuroAddress) {
      return azuroAddress;
    }
    
    // For authenticated Privy users without Azuro address, find embedded wallet
    if (authenticated && wallets.length > 0) {
      // Prefer embedded wallet (created by Privy for email users)
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      if (embeddedWallet) {
        return embeddedWallet.address;
      }
      
      // Fallback to any wallet with a connectedAt timestamp (means it's active)
      const connectedWallet = wallets.find(w => w.connectedAt);
      if (connectedWallet) {
        return connectedWallet.address;
      }
      
      // Last resort: first wallet
      return wallets[0]?.address || null;
    }
    
    return null;
  };

  // Determine effective wallet state based on user type (Privy only now)
  const getEffectiveWalletState = () => {
    const activeAddress = getActiveWalletAddress();
    const connected = !!activeAddress && authenticated;
    
    // Determine if this is an embedded wallet (email user)
    const hasEmbeddedWallet = wallets.some(w => w.walletClientType === 'privy');
    
    return {
      address: activeAddress,
      isConnected: connected,
      chainId: chainId || null,
      network: chainId ? { name: 'Polygon', chainId } : null,
      hasEmbeddedWallet,
    };
  };

  const effectiveState = getEffectiveWalletState();

  // User is truly connected only if:
  // 1. Has an address
  // 2. Privy is authenticated
  // 3. Not in recovery state
  const isTrulyConnected = useMemo(() => {
    return effectiveState.isConnected && !isRecovering && !needsReconnection;
  }, [effectiveState.isConnected, isRecovering, needsReconnection]);

  const connectWallet = async () => {
    logger.wallet('🔌 Connect wallet requested');
    
    try {
      await login();
      logger.wallet('✅ Privy wallet connected successfully');
    } catch (error: any) {
      logger.error('❌ Failed to connect wallet:', error);
      
      // Handle specific error types
      if (error?.message?.includes('Buffer is not defined')) {
        logger.error('❌ Browser polyfill issue detected');
        throw new Error('Browser compatibility issue. Please refresh and try again.');
      }
      
      if (error?.message?.includes('personal_sign')) {
        logger.error('❌ Smart wallet creation failed');
        throw new Error('Smart wallet creation failed. Please try again or use a different wallet.');
      }
      
      if (error?.message?.includes('CORS') || error?.message?.includes('Cross-Origin')) {
        logger.error('❌ CORS error with Privy service');
        throw new Error('Connection service temporarily unavailable. Please try again.');
      }
      
      throw error;
    }
  };

  const disconnectWallet = async () => {
    logger.wallet('🔌 Disconnect wallet requested');
    
    try {
      await logout();
      logger.wallet('✅ Wallet disconnected successfully');
    } catch (error) {
      logger.error('❌ Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const switchNetwork = async (newChainId: number) => {
    if (walletClient?.switchChain) {
      await walletClient.switchChain({ id: newChainId });
    }
  };

  return {
    // Core wallet state
    address: effectiveState.address,
    isConnected: isTrulyConnected,
    isConnecting,
    chainId: effectiveState.chainId,
    network: effectiveState.network,
    
    // Session recovery states
    isRecoveringSession: isRecovering,
    needsPrivyReconnection: needsReconnection,
    privyReady: ready,
    privyAuthenticated: authenticated,
    
    // Legacy compatibility (will be removed in next phase)
    walletAddress: effectiveState.address || null,
    isWalletConnected: isTrulyConnected,
    external: {
      address: effectiveState.address,
      isConnected: isTrulyConnected,
      isConnecting,
      chainId: effectiveState.chainId,
      network: effectiveState.network,
      isModalOpen: false,
    },
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Legacy compatibility
    connectExternal: connectWallet,
    disconnectExternal: disconnectWallet,
    
    // Utils
    isLoading: isConnecting || isRecovering,
    hasAnyWallet: effectiveState.isConnected,
    walletClient,
    wallets, // Expose all Privy wallets for advanced use cases
    
    // Azuro Social Login specific
    isAAWallet: isAAWallet || effectiveState.hasEmbeddedWallet || false,
  };
}
