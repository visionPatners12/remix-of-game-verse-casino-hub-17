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
 * 
 * Order matters for Wagmi/Privy:
 * 1. PersistQueryClientProvider - QueryClient must be available FIRST (Wagmi needs it)
 * 2. PrivyProvider - Wallet initialization (initializes Wagmi internally)
 * 3. SmartWalletsProvider - Privy smart wallets
 * 4. AuthProvider - Supabase auth
 */
export const ExternalProviders = memo(({ children }: ExternalProvidersProps) => (
  <PersistQueryClientProvider 
    client={queryClient}
    persistOptions={{
      persister: queryPersister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
      buster: 'v3',
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  </PersistQueryClientProvider>
));

ExternalProviders.displayName = 'ExternalProviders';
