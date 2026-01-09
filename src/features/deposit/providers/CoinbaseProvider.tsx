import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { polygon } from 'wagmi/chains';

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
          mode: 'dark',
          theme: 'base',
        },
      }}
      chain={polygon}
      apiKey="W0lNgoVAMtfoPOXNZaOnHAneo8oYC1IX"
      projectId="cc348ae5-5cea-4d01-b3ae-106d367715c1"
    >
      {children}
    </OnchainKitProvider>
  );
};