import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

interface CoinbaseProviderProps {
  children: React.ReactNode;
}

/**
 * Coinbase OnchainKit provider for deposit features only
 * Localizes OnchainKit to where it's actually needed
 */
export const CoinbaseProvider: React.FC<CoinbaseProviderProps> = ({ children }) => {
  return (
    <OnchainKitProvider
      config={{
        appearance: {
          name: 'Azuro Betting Platform',
          logo: 'https://onchainkit.xyz/favicon/48x48.png?v4-19-24',
          mode: 'auto',
          theme: 'default',
        },
      }}
      chain={base}
      apiKey="02b31654-4176-4b84-95ad-5cfa3d897195"
      projectId="4f2b1591-6e22-463c-a481-3f2a6bf15c10"
    >
      {children}
    </OnchainKitProvider>
  );
};