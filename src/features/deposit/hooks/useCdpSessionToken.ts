import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      
      const { data, error: fnError } = await supabase.functions.invoke('cdp-session-token', {
        body: {
          addresses: [{ address: walletAddress, blockchains: ['base'] }],
          assets: ['USDC']
        }
      });

      if (fnError) {
        console.error('[CDP Session Token] Function error:', fnError);
        throw new Error(fnError.message || 'Failed to generate session token');
      }

      if (!data?.token) {
        console.error('[CDP Session Token] No token in response:', data);
        throw new Error('No token received from Coinbase');
      }

      console.log('[CDP Session Token] Token generated successfully');
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
