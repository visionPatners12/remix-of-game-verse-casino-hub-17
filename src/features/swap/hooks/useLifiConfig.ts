// LI.FI SDK Configuration Hook - Configures SDK with wallet provider
import { useEffect, useRef, useState, useCallback } from 'react';
import { createConfig, EVM, type SDKProvider } from '@lifi/sdk';
import { createWalletClient, custom, type Chain } from 'viem';
import { polygon, mainnet, arbitrum, optimism, base, bsc } from 'viem/chains';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

// Chain ID to viem chain mapping
const CHAIN_MAP: Record<number, Chain> = {
  1: mainnet,
  137: polygon,
  42161: arbitrum,
  10: optimism,
  8453: base,
  56: bsc,
};

// Initialize LI.FI SDK with EVM provider using the active Privy wallet
export function useLifiConfig() {
  const { address, isConnected, isAAWallet, wallets } = useUnifiedWallet();
  const configuredAddressRef = useRef<string | null>(null);
  const currentChainIdRef = useRef<number>(137); // Default to Polygon
  const [isReady, setIsReady] = useState(false);

  // Get the active Privy wallet for signing
  const activePrivyWallet = wallets?.find(w => w.walletClientType === 'privy') || wallets?.[0];

  // Debug: Log wallet configuration
  useEffect(() => {
    console.log('[LiFi Config] Wallet state:', {
      address,
      isAAWallet,
      isConnected,
      walletType: activePrivyWallet?.walletClientType,
    });
  }, [address, isAAWallet, isConnected, activePrivyWallet]);

  // Create a proper viem WalletClient from Privy provider
  const createViemClient = useCallback(async (chainId?: number) => {
    if (!activePrivyWallet || !address) {
      throw new Error('No compatible wallet found. Please reconnect.');
    }

    const targetChainId = chainId || currentChainIdRef.current;
    const chain = CHAIN_MAP[targetChainId] || polygon;
    
    const provider = await activePrivyWallet.getEthereumProvider();
    
    // Create a proper viem WalletClient with the EIP-1193 provider
    const client = createWalletClient({
      account: address as `0x${string}`,
      chain,
      transport: custom(provider),
    });

    return client;
  }, [activePrivyWallet, address]);

  // Reconfigure SDK when address changes
  useEffect(() => {
    if (!address || !activePrivyWallet) {
      setIsReady(false);
      return;
    }
    if (configuredAddressRef.current === address) {
      setIsReady(true);
      return;
    }

    const getWalletClient = async () => {
      console.log('[LiFi] getWalletClient called, address:', address);
      return createViemClient();
    };

    const switchChain = async (chainId: number) => {
      console.log('[LiFi] switchChain called, chainId:', chainId);
      
      if (!activePrivyWallet) {
        throw new Error('No compatible wallet found. Please reconnect.');
      }

      try {
        await activePrivyWallet.switchChain(chainId);
        currentChainIdRef.current = chainId;
        return createViemClient(chainId);
      } catch (err) {
        console.error('[LiFi] Failed to switch chain:', err);
        throw new Error('Failed to switch network. Please try again.');
      }
    };

    createConfig({
      integrator: 'PRYZEN',
      providers: [
        EVM({
          getWalletClient: getWalletClient as any,
          switchChain: switchChain as any,
        }),
      ] as SDKProvider[],
    });

    configuredAddressRef.current = address;
    setIsReady(true);
    console.log('[LiFi] SDK configured for address:', address);
  }, [address, activePrivyWallet, createViemClient]);

  return {
    isReady: isConnected && !!address && isReady,
  };
}
