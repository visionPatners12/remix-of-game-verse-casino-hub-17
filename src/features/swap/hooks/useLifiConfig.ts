import { createConfig, EVM, SDKProvider } from '@lifi/sdk';
import { createWalletClient, custom } from 'viem';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { CHAIN_MAP, DEFAULT_CHAIN, DEFAULT_CHAIN_ID } from '@/config/chains';

// Initialize LI.FI SDK with EVM provider using the active Privy wallet
export function useLifiConfig(fromChainId?: number) {
  const { address, signerAddress, activePrivyWallet, isConnected, isAAWallet } = useUnifiedWallet();
  const configuredAddressRef = useRef<string | null>(null);
  const currentChainIdRef = useRef<number>(fromChainId || DEFAULT_CHAIN_ID);
  const [isReady, setIsReady] = useState(false);

  // Sync currentChainIdRef with fromChainId prop
  useEffect(() => {
    if (fromChainId && fromChainId !== currentChainIdRef.current) {
      console.log('[LiFi Config] Syncing chain ref:', fromChainId);
      currentChainIdRef.current = fromChainId;
    }
  }, [fromChainId]);

  // Debug: Log wallet configuration
  useEffect(() => {
    console.log('[LiFi Config] Wallet state:', {
      address, // Effective wallet holding funds (AA or EOA)
      signerAddress, // EOA for signing transactions
      isAAWallet,
      isConnected,
      walletType: activePrivyWallet?.walletClientType,
      targetChainId: currentChainIdRef.current,
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
      console.log('[LiFi] getWalletClient called, signerAddress:', signerAddress, 'targetChain:', currentChainIdRef.current);
      
      // Get current chain from wallet
      const provider = await activePrivyWallet.getEthereumProvider();
      const walletChainIdHex = await provider.request({ method: 'eth_chainId' });
      const currentWalletChain = parseInt(walletChainIdHex as string, 16);
      
      console.log('[LiFi] Wallet current chain:', currentWalletChain, 'expected chain:', currentChainIdRef.current);
      
      // If wallet is on different chain than expected, switch first
      if (currentWalletChain !== currentChainIdRef.current) {
        console.log('[LiFi] Wallet on wrong chain, switching to:', currentChainIdRef.current);
        try {
          await activePrivyWallet.switchChain(currentChainIdRef.current);
        } catch (err) {
          console.error('[LiFi] Failed to auto-switch chain:', err);
          // Continue anyway - SDK might handle this
        }
      }
      
      return createViemClient(currentChainIdRef.current);
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
    switchToChain: async (chainId: number) => {
      if (activePrivyWallet) {
        await activePrivyWallet.switchChain(chainId);
        currentChainIdRef.current = chainId;
      }
    },
  };
}
