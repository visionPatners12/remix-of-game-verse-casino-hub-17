import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';

interface CoinbaseProviderProps {
  children: React.ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  return (
    <OnchainKitProvider
      chain={base}
      config={{
        appearance: {
          mode: 'dark',
          theme: 'base',
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
};
