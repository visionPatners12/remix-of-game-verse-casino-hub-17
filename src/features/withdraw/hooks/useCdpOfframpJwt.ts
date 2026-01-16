import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Offramp API uses different host than Onramp
const CDP_OFFRAMP_HOST = 'api.developer.coinbase.com';
const CDP_OFFRAMP_PATH = '/onramp/v1/sell/quote';
const CDP_OFFRAMP_METHOD = 'POST';

interface UseCdpOfframpJwtResult {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: number | null;
  isExpired: boolean;
  refresh: () => Promise<string | null>;
}

export const useCdpOfframpJwt = (): UseCdpOfframpJwtResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const refreshingRef = useRef(false);

  const isExpired = expiresAt ? Date.now() >= expiresAt : true;

  const generateToken = useCallback(async (): Promise<string | null> => {
    // Prevent concurrent refresh attempts
    if (refreshingRef.current) {
      console.log('[useCdpOfframpJwt] Already refreshing, skipping...');
      return token;
    }

    refreshingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCdpOfframpJwt] Generating JWT for Offramp API...');
      
      const { data, error: fnError } = await supabase.functions.invoke('cdp-session-token', {
        body: {
          requestHost: CDP_OFFRAMP_HOST,
          requestPath: CDP_OFFRAMP_PATH,
          requestMethod: CDP_OFFRAMP_METHOD,
          expiresIn: 300, // 5 minutes
        },
      });

      if (fnError) {
        console.error('[useCdpOfframpJwt] Function error:', fnError);
        throw new Error(fnError.message || 'Failed to invoke edge function');
      }

      if (data?.error) {
        console.error('[useCdpOfframpJwt] Response error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.token) {
        console.error('[useCdpOfframpJwt] No token in response:', data);
        throw new Error('No token received from edge function');
      }

      console.log('[useCdpOfframpJwt] JWT generated successfully, expires in:', data.expiresIn, 'seconds');
      
      const newToken = data.token;
      const newExpiresAt = Date.now() + (data.expiresIn || 300) * 1000 - 10000; // 10s buffer
      
      setToken(newToken);
      setExpiresAt(newExpiresAt);
      
      return newToken;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate offramp JWT';
      console.error('[useCdpOfframpJwt] Error:', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
      refreshingRef.current = false;
    }
  }, [token]);

  const refresh = useCallback(async (): Promise<string | null> => {
    // Return existing token if still valid
    if (token && !isExpired) {
      console.log('[useCdpOfframpJwt] Token still valid, reusing...');
      return token;
    }
    return generateToken();
  }, [token, isExpired, generateToken]);

  // Generate token on mount
  useEffect(() => {
    generateToken();
  }, []);

  return {
    token,
    isLoading,
    error,
    expiresAt,
    isExpired,
    refresh,
  };
};
