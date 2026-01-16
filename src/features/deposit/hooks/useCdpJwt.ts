import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Default configuration for onramp sessions API
const CDP_ONRAMP_HOST = 'api.cdp.coinbase.com';
const CDP_ONRAMP_PATH = '/platform/v2/onramp/sessions';
const CDP_ONRAMP_METHOD = 'POST';
const DEFAULT_EXPIRES_IN = 300; // 5 minutes

interface UseCdpJwtResult {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: number | null;
  isExpired: boolean;
  refresh: () => Promise<string | null>;
}

export const useCdpJwt = (): UseCdpJwtResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const refreshingRef = useRef(false);

  const isExpired = expiresAt ? Date.now() > expiresAt : false;

  const generateToken = useCallback(async (): Promise<string | null> => {
    // Prevent concurrent refreshes
    if (refreshingRef.current) {
      console.log('[useCdpJwt] Already refreshing, skipping...');
      return token;
    }

    refreshingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCdpJwt] Generating JWT for onramp sessions API...');

      const { data, error: fnError } = await supabase.functions.invoke('cdp-session-token', {
        body: {
          requestHost: CDP_ONRAMP_HOST,
          requestPath: CDP_ONRAMP_PATH,
          requestMethod: CDP_ONRAMP_METHOD,
          expiresIn: DEFAULT_EXPIRES_IN,
        },
      });

      if (fnError) {
        console.error('[useCdpJwt] Function invocation error:', fnError);
        
        let errorMessage = fnError.message || 'Failed to invoke edge function';
        
        // Try to extract error details from response context
        if (fnError.context && typeof fnError.context.json === 'function') {
          try {
            const errorBody = await fnError.context.json();
            console.error('[useCdpJwt] Error body:', errorBody);
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            }
          } catch {
            // Ignore parse errors
          }
        }
        
        throw new Error(errorMessage);
      }

      if (data?.error) {
        console.error('[useCdpJwt] Edge function error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.token) {
        console.error('[useCdpJwt] No token in response:', data);
        throw new Error('No token received');
      }

      const expiresInMs = (data.expiresIn || DEFAULT_EXPIRES_IN) * 1000;
      // Set expiration 10 seconds early to avoid edge cases
      const expirationTime = Date.now() + expiresInMs - 10000;

      console.log('[useCdpJwt] JWT generated successfully, expires at:', new Date(expirationTime).toISOString());

      setToken(data.token);
      setExpiresAt(expirationTime);
      setError(null);
      
      return data.token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate JWT';
      console.error('[useCdpJwt] Error:', errorMessage);
      setError(errorMessage);
      setToken(null);
      setExpiresAt(null);
      return null;
    } finally {
      setIsLoading(false);
      refreshingRef.current = false;
    }
  }, [token]);

  // Auto-refresh when expired
  const refresh = useCallback(async (): Promise<string | null> => {
    // If token exists and not expired, return it
    if (token && expiresAt && Date.now() < expiresAt) {
      console.log('[useCdpJwt] Token still valid, using cached token');
      return token;
    }
    
    // Otherwise generate new token
    return generateToken();
  }, [token, expiresAt, generateToken]);

  // Generate token on mount
  useEffect(() => {
    generateToken();
  }, [generateToken]);

  return {
    token,
    isLoading,
    error,
    expiresAt,
    isExpired,
    refresh,
  };
};
