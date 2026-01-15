import React, { memo } from 'react';
import { PrivyProvider } from '@azuro-org/sdk-social-aa-connector';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import { AuthProvider } from '@/features/auth';
import { queryClient } from '@/lib/queryClient';
import { queryPersister } from '@/lib/queryPersister';
import { privyConfig, wagmiConfig } from './config';

// Configure offline query manager
import '@/lib/queryOfflineConfig';

// Coinbase CDP credentials
const COINBASE_API_KEY = '02b31654-4176-4b84-95ad-5cfa3d897195';
const COINBASE_PROJECT_ID = '4f2b1591-6e22-463c-a481-3f2a6bf15c10';

interface ExternalProvidersProps {
  children: React.ReactNode;
}

// Queries importantes à persister même en cas d'erreur partielle
const IMPORTANT_QUERY_KEYS = ['ludo-games', 'user-profile', 'wallet-balance'];

/**
 * External service providers (Privy wallet integration)
 * Optimized for Ludo gaming application
 */
export const ExternalProviders = memo(({ children }: ExternalProvidersProps) => (
  <AuthProvider>
    <PersistQueryClientProvider 
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
        buster: 'v3', // Incrémenté pour invalider l'ancien cache
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            if (query.state.status === 'success') return true;
            
            const queryKey = query.queryKey;
            const isImportant = IMPORTANT_QUERY_KEYS.some(key => 
              queryKey.includes(key) || queryKey[0] === key
            );
            return isImportant && query.state.data !== undefined;
          },
        },
      }}
    >
      <PrivyProvider
        appId="cme85bkid00p4js0bgmdigg64"
        privyConfig={privyConfig}
        wagmiConfig={wagmiConfig}
      >
        <SmartWalletsProvider>
          <OnchainKitProvider
            apiKey={COINBASE_API_KEY}
            projectId={COINBASE_PROJECT_ID}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </SmartWalletsProvider>
      </PrivyProvider>
    </PersistQueryClientProvider>
  </AuthProvider>
));

ExternalProviders.displayName = 'ExternalProviders';
