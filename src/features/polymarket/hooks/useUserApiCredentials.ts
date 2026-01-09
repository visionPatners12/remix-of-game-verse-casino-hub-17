// Hook to derive or create Polymarket API credentials via L1 signature

import { useState, useCallback } from 'react';
import { ClobClient } from '@polymarket/clob-client';
import { CLOB_API_URL, POLYGON_CHAIN_ID } from '../constants/contracts';
import { wrapSignerForV5Compat } from '../utils/ethersAdapter';
import { logger } from '@/utils/logger';
import type { ApiKeyCreds } from './useClobClient';

const STORAGE_KEY = 'polymarket_api_creds';

export function useUserApiCredentials() {
  const [credentials, setCredentials] = useState<ApiKeyCreds | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load credentials from localStorage
  const loadFromStorage = useCallback((address: string): ApiKeyCreds | null => {
    try {
      const key = `${STORAGE_KEY}_${address.toLowerCase()}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as ApiKeyCreds;
        if (parsed.key && parsed.secret && parsed.passphrase) {
          setCredentials(parsed);
          logger.info('[ApiCredentials] Loaded from storage');
          return parsed;
        }
      }
    } catch (err) {
      logger.warn('[ApiCredentials] Failed to load from storage:', err);
    }
    return null;
  }, []);

  // Save credentials to localStorage
  const saveToStorage = useCallback((address: string, creds: ApiKeyCreds) => {
    try {
      const key = `${STORAGE_KEY}_${address.toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(creds));
      logger.info('[ApiCredentials] Saved to storage');
    } catch (err) {
      logger.warn('[ApiCredentials] Failed to save to storage:', err);
    }
  }, []);

  // Derive or create API credentials using L1 signature
  const deriveCredentials = useCallback(async (signer: any): Promise<ApiKeyCreds> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if signer already has required methods (Smart Wallet adapter)
      const hasRequiredMethods = 
        typeof signer._signTypedData === 'function' && 
        typeof signer.signMessage === 'function' &&
        typeof signer.getAddress === 'function';
      
      // Only wrap if not already compatible
      const wrappedSigner = hasRequiredMethods 
        ? signer 
        : wrapSignerForV5Compat(signer);
      
      const address = await wrappedSigner.getAddress();
      logger.info('[ApiCredentials] Deriving credentials for:', address);

      // Create a temporary ClobClient without credentials for derivation
      const tempClient = new ClobClient(
        CLOB_API_URL,
        POLYGON_CHAIN_ID,
        wrappedSigner
      );

      let creds: ApiKeyCreds;

      try {
        // Try to derive existing credentials first
        creds = await tempClient.deriveApiKey() as ApiKeyCreds;
        logger.info('[ApiCredentials] Derived existing credentials');
      } catch {
        // If no existing credentials, create new ones
        logger.info('[ApiCredentials] No existing credentials, creating new...');
        creds = await tempClient.createApiKey() as ApiKeyCreds;
        logger.info('[ApiCredentials] Created new credentials');
      }

      // Validate the credentials
      if (!creds.key || !creds.secret || !creds.passphrase) {
        throw new Error('Invalid credentials received from API');
      }

      // Save and set
      saveToStorage(address, creds);
      setCredentials(creds);

      return creds;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to derive credentials';
      logger.error('[ApiCredentials] Error:', message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveToStorage]);

  // Clear credentials
  const clearCredentials = useCallback((address?: string) => {
    setCredentials(null);
    setError(null);
    if (address) {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_${address.toLowerCase()}`);
      } catch {}
    }
  }, []);

  return {
    credentials,
    deriveCredentials,
    loadFromStorage,
    clearCredentials,
    isLoading,
    error,
  };
}
