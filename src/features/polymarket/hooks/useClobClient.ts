// Hook to initialize ClobClient with BuilderConfig for remote signing

import { useState, useCallback } from 'react';
import { ClobClient } from '@polymarket/clob-client';
import { BuilderConfig } from '@polymarket/builder-signing-sdk';
import { SignatureType } from '@polymarket/order-utils';
import { CLOB_API_URL, POLYGON_CHAIN_ID } from '../constants/contracts';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ApiKeyCreds {
  key: string;
  secret: string;
  passphrase: string;
}

export function useClobClient() {
  const [clobClient, setClobClient] = useState<ClobClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClobClient = useCallback(async (
    signer: any,
    credentials: ApiKeyCreds,
    funderAddress: string,
    isSmartWallet: boolean = false
  ): Promise<ClobClient | null> => {
    setIsInitializing(true);
    setError(null);

    try {
      logger.info('[ClobClient] Initializing with remote builder signing...');
      logger.info('[ClobClient] isSmartWallet:', isSmartWallet);

      // Build the remote builder config for edge function signing
      const supabaseUrl = (supabase as any).supabaseUrl || 
        import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = (supabase as any).supabaseKey || 
        import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Create BuilderConfig with remote signing via edge function
      const builderConfig = new BuilderConfig({
        remoteBuilderConfig: {
          url: `${supabaseUrl}/functions/v1/polymarket-builder-sign`,
          token: supabaseKey,
        },
      });

      logger.info('[ClobClient] BuilderConfig created, type:', builderConfig.getBuilderType());

      // SignatureType: 0 = EOA, 2 = EOA associated with Gnosis Safe (Smart Wallet)
      const sigType = isSmartWallet ? 2 : SignatureType.EOA;
      logger.info('[ClobClient] Using SignatureType:', sigType);

      const client = new ClobClient(
        CLOB_API_URL,
        POLYGON_CHAIN_ID,
        signer,
        credentials,
        sigType,
        funderAddress,
        undefined, // geoBlockToken
        false, // useServerTime
        builderConfig
      );

      setClobClient(client);
      logger.info('[ClobClient] Initialized successfully');
      return client;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize ClobClient';
      logger.error('[ClobClient] Init error:', message);
      setError(message);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const resetClobClient = useCallback(() => {
    setClobClient(null);
    setError(null);
  }, []);

  return {
    clobClient,
    initializeClobClient,
    resetClobClient,
    isInitializing,
    error,
  };
}
