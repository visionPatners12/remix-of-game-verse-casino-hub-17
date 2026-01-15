import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import '@coinbase/onchainkit/styles.css';

// CDP Public Keys (safe to expose in frontend)
const CDP_API_KEY = '02b31654-4176-4b84-95ad-5cfa3d897195';
const CDP_PROJECT_ID = '4f2b1591-6e22-463c-a481-3f2a6bf15c10';

interface CoinbaseProviderProps {
  children: React.ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  return (
    <OnchainKitProvider
      apiKey={CDP_API_KEY}
      projectId={CDP_PROJECT_ID}
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
