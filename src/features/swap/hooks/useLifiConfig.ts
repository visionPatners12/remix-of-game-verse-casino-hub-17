// LI.FI SDK Configuration Hook - Configures SDK with wallet provider
import { useEffect, useRef } from 'react';
import { createConfig, EVM, type SDKProvider } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';
import { wagmiConfig } from '@/config/wagmi';
import { useAccount } from 'wagmi';

// Initialize LI.FI SDK with EVM provider using wagmi core actions
export function useLifiConfig() {
  const { address, isConnected } = useAccount();
  const configuredRef = useRef(false);

  useEffect(() => {
    // Configure SDK only once
    if (configuredRef.current) return;

    const getClient = async () => {
      const client = await getWalletClient(wagmiConfig as any);
      if (!client) {
        throw new Error('Wallet not connected');
      }
      return client as any;
    };

    const switchAndGetClient = async (chainId: number) => {
      await switchChain(wagmiConfig as any, { chainId });
      const client = await getWalletClient(wagmiConfig as any, { chainId });
      if (!client) {
        throw new Error('Wallet not connected after chain switch');
      }
      return client as any;
    };

    createConfig({
      integrator: 'PRYZEN',
      providers: [
        EVM({
          getWalletClient: getClient,
          switchChain: switchAndGetClient,
        } as any),
      ] as SDKProvider[],
    });

    configuredRef.current = true;
  }, []);

  return {
    isReady: isConnected && !!address,
  };
}
