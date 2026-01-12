import React, { memo } from 'react';
import { PrivyProvider } from '@azuro-org/sdk-social-aa-connector';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AuthProvider } from '@/features/auth';
import { queryClient } from '@/lib/queryClient';
import { queryPersister } from '@/lib/queryPersister';
import { privyConfig, wagmiConfig } from './config';

// Configure offline query manager
import '@/lib/queryOfflineConfig';

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
          {children}
        </SmartWalletsProvider>
      </PrivyProvider>
    </PersistQueryClientProvider>
  </AuthProvider>
));

ExternalProviders.displayName = 'ExternalProviders';
