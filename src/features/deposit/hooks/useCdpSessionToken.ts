import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getChainSlug, DEFAULT_CHAIN_ID } from '@/config/chains';

interface UseCdpSessionTokenResult {
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

export const useCdpSessionToken = (walletAddress: string | undefined): UseCdpSessionTokenResult => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = useCallback(async () => {
    if (!walletAddress) {
      setError('No wallet address available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[CDP Session Token] Generating token for address:', walletAddress);
      
      const { data, error: fnError } = await supabase.functions.invoke('cdp-onramp?endpoint=token', {
        body: {
          addresses: [{ address: walletAddress, blockchains: [getChainSlug(DEFAULT_CHAIN_ID)] }],
          assets: ['USDC'],
        },
      });

      // Handle function invocation error
      if (fnError) {
        console.error('[CDP Session Token] Function invocation error:', fnError);
        
        let errorMessage = fnError.message || 'Failed to invoke edge function';
        
        // Extract error body from fnError.context (Response object) for non-2xx responses
        if (fnError.context && typeof fnError.context.json === 'function') {
          try {
            const errorBody = await fnError.context.json();
            console.error('[CDP Session Token] Error body:', errorBody);
            if (errorBody?.error) {
              errorMessage = errorBody.details?.message || errorBody.error;
            }
          } catch (parseError) {
            console.warn('[CDP Session Token] Could not parse error context:', parseError);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Handle Coinbase API errors returned by the edge function
      if (data?.error) {
        console.error('[CDP Session Token] Coinbase error:', data.error, data.details);
        const errorMsg = data.details?.message || data.error;
        throw new Error(errorMsg);
      }

      // Validate token exists
      if (!data?.token) {
        console.error('[CDP Session Token] No token in response:', data);
        throw new Error('No token received from Coinbase');
      }

      console.log('[CDP Session Token] Token generated successfully, channel_id:', data.channel_id);
      setSessionToken(data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate session token';
      console.error('[CDP Session Token] Error:', errorMessage);
      setError(errorMessage);
      setSessionToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      generateToken();
    }
  }, [walletAddress, generateToken]);

  return { sessionToken, isLoading, error, regenerate: generateToken };
};
