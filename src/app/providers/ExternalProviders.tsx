import React, { memo } from 'react';
import { PrivyProvider } from '@azuro-org/sdk-social-aa-connector';
import { WagmiProvider } from '@privy-io/wagmi';
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
 * 1. PrivyProvider - Wallet initialization
 * 2. QueryClientProvider - Required by Wagmi hooks
 * 3. WagmiProvider - Wagmi hooks (useReconnect, etc.)
 * 4. SmartWalletsProvider - Privy smart wallets
 * 5. AuthProvider - Supabase auth
 */
export const ExternalProviders = memo(({ children }: ExternalProvidersProps) => (
  <PrivyProvider
    appId="cme85bkid00p4js0bgmdigg64"
    privyConfig={privyConfig}
    wagmiConfig={wagmiConfig}
  >
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
      <WagmiProvider config={wagmiConfig}>
        <SmartWalletsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SmartWalletsProvider>
      </WagmiProvider>
    </PersistQueryClientProvider>
  </PrivyProvider>
));

ExternalProviders.displayName = 'ExternalProviders';
