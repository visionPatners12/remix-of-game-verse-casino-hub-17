// LI.FI SDK Configuration Hook - Configures SDK with wallet provider
import { useEffect, useRef, useState, useCallback } from 'react';
import { createConfig, EVM, type SDKProvider } from '@lifi/sdk';
import { createWalletClient, custom } from 'viem';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { CHAIN_MAP, DEFAULT_CHAIN, DEFAULT_CHAIN_ID } from '@/config/chains';

// Initialize LI.FI SDK with EVM provider using the active Privy wallet
export function useLifiConfig() {
  const { address, signerAddress, activePrivyWallet, isConnected, isAAWallet } = useUnifiedWallet();
  const configuredAddressRef = useRef<string | null>(null);
  const currentChainIdRef = useRef<number>(DEFAULT_CHAIN_ID); // Default to Base
  const [isReady, setIsReady] = useState(false);

  // Debug: Log wallet configuration
  useEffect(() => {
    console.log('[LiFi Config] Wallet state:', {
      address, // Effective wallet holding funds (AA or EOA)
      signerAddress, // EOA for signing transactions
      isAAWallet,
      isConnected,
      walletType: activePrivyWallet?.walletClientType,
    });
  }, [address, signerAddress, isAAWallet, isConnected, activePrivyWallet]);

  // Create a proper viem WalletClient from Privy provider
  const createViemClient = useCallback(async (chainId?: number) => {
    if (!activePrivyWallet || !signerAddress) {
      throw new Error('No compatible wallet found. Please reconnect.');
    }

    const targetChainId = chainId || currentChainIdRef.current;
    const chain = CHAIN_MAP[targetChainId] || DEFAULT_CHAIN;
    
    const provider = await activePrivyWallet.getEthereumProvider();
    
    // Create a proper viem WalletClient with the EIP-1193 provider
    const client = createWalletClient({
      account: signerAddress as `0x${string}`,
      chain,
      transport: custom(provider),
    });

    return client;
  }, [activePrivyWallet, signerAddress]);

  // Reconfigure SDK when signer address changes
  useEffect(() => {
    if (!signerAddress || !activePrivyWallet) {
      setIsReady(false);
      return;
    }
    if (configuredAddressRef.current === signerAddress) {
      setIsReady(true);
      return;
    }

    const getWalletClient = async () => {
      console.log('[LiFi] getWalletClient called, signerAddress:', signerAddress);
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

    configuredAddressRef.current = signerAddress;
    setIsReady(true);
    console.log('[LiFi] SDK configured for signerAddress:', signerAddress);
  }, [signerAddress, activePrivyWallet, createViemClient]);

  return {
    isReady: isConnected && !!signerAddress && isReady,
  };
}
