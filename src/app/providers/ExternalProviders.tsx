import React, { memo } from 'react';
import { PrivyProvider } from '@azuro-org/sdk-social-aa-connector';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { AzuroSDKProvider } from '@azuro-org/sdk';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AuthProvider } from '@/features/auth';
import { StreamProvider } from '@/contexts/StreamProvider';
import { TradingProvider } from '@/features/polymarket/providers/TradingProvider';
import { BuyModal } from '@/features/polymarket/components/modals/BuyModal';
import { queryClient } from '@/lib/queryClient';
import { queryPersister } from '@/lib/queryPersister';
import { privyConfig, wagmiConfig } from './config';

// Configure offline query manager
import '@/lib/queryOfflineConfig';

interface ExternalProvidersProps {
  children: React.ReactNode;
}

// Queries importantes à persister même en cas d'erreur partielle
const IMPORTANT_QUERY_KEYS = ['timeline-feed', 'user-profile', 'navigation', 'wallet-balance'];

/**
 * External service providers (ThirdWeb, Privy, Azuro, GetStream)
 * Clean separation of third-party integrations
 */
export const ExternalProviders = memo(({ children }: ExternalProvidersProps) => (
  <AuthProvider>
    <PersistQueryClientProvider 
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours (amélioré pour offline)
        buster: 'v2', // Incrémenté pour invalider l'ancien cache
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Toujours persister les queries réussies
            if (query.state.status === 'success') return true;
            
            // Persister aussi les queries importantes même si en erreur
            const queryKey = query.queryKey;
            const isImportant = IMPORTANT_QUERY_KEYS.some(key => 
              queryKey.includes(key) || queryKey[0] === key
            );
            return isImportant && query.state.data !== undefined;
          },
        },
      }}
    >
      <StreamProvider>
        <PrivyProvider
          appId="cme85bkid00p4js0bgmdigg64"
          privyConfig={privyConfig}
          wagmiConfig={wagmiConfig}
        >
          <SmartWalletsProvider>
            <AzuroSDKProvider initialChainId={137}>
              <TradingProvider>
                {children}
                <BuyModal />
              </TradingProvider>
            </AzuroSDKProvider>
          </SmartWalletsProvider>
        </PrivyProvider>
      </StreamProvider>
    </PersistQueryClientProvider>
  </AuthProvider>
));

ExternalProviders.displayName = 'ExternalProviders';