import { useConnect, useDisconnect, useWalletClient, useSwitchChain } from 'wagmi';
import { useAccount } from '@azuro-org/sdk-social-aa-connector';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/hooks/useAuth';

import { logger } from '@/utils/logger';
/**
 * Unified wallet hook that combines all wallet functionality
 * Replaces useRealWallet, useSimpleWallet, and eliminates wallet confusion
 */
export function useUnifiedWallet() {
  const { userType } = useAuth();
  
  const { address, isConnected, isConnecting, chainId, isAAWallet } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { ready, authenticated, login, logout } = usePrivy();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Determine effective wallet state based on user type (Privy only now)
  const getEffectiveWalletState = () => {
    // For all users, use Privy wallet state
    const privyAddress = address || null;
    const connected = !!privyAddress;
    
    return {
      address: privyAddress,
      isConnected: connected,
      chainId: chainId || null,
      network: chainId ? { name: 'Ethereum', chainId } : null,
    };
  };

  const effectiveState = getEffectiveWalletState();

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
    isConnected: effectiveState.isConnected,
    isConnecting,
    chainId: effectiveState.chainId,
    network: effectiveState.network,
    
    // Legacy compatibility (will be removed in next phase)
    walletAddress: effectiveState.address || null,
    isWalletConnected: effectiveState.isConnected,
    external: {
      address: effectiveState.address,
      isConnected: effectiveState.isConnected,
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
    isLoading: isConnecting,
    hasAnyWallet: effectiveState.isConnected,
    walletClient,
    
    // Azuro Social Login specific
    isAAWallet: isAAWallet || false,
    
    // Additional compatibility
    authenticated,
  } as const;
}