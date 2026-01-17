import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnrampSessionRequest {
  walletAddress: string;
  paymentAmount: string;
  paymentCurrency?: string;
  purchaseCurrency?: string;
  destinationNetwork?: string;
  paymentMethod: string;
  country: string;
  subdivision?: string;
  redirectUrl?: string;
  partnerUserRef?: string;
}

export interface OnrampFee {
  type: string;
  amount: string;
  currency: string;
}

export interface OnrampQuote {
  paymentTotal: string;
  paymentSubtotal: string;
  paymentCurrency: string;
  purchaseAmount: string;
  purchaseCurrency: string;
  destinationNetwork: string;
  fees: OnrampFee[];
  exchangeRate: string;
}

export interface OnrampSession {
  onrampUrl: string;
}

export interface OnrampSessionResponse {
  session: OnrampSession;
  quote: OnrampQuote;
}

interface UseCdpOnrampSessionResult {
  session: OnrampSession | null;
  quote: OnrampQuote | null;
  isLoading: boolean;
  error: string | null;
  createSession: (request: OnrampSessionRequest) => Promise<OnrampSessionResponse | null>;
  reset: () => void;
}

export const useCdpOnrampSession = (): UseCdpOnrampSessionResult => {
  const [session, setSession] = useState<OnrampSession | null>(null);
  const [quote, setQuote] = useState<OnrampQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (request: OnrampSessionRequest): Promise<OnrampSessionResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCdpOnrampSession] Creating session via edge function with params:', {
        walletAddress: request.walletAddress,
        paymentAmount: request.paymentAmount,
        paymentMethod: request.paymentMethod,
        country: request.country,
      });

      const payload = {
        purchaseCurrency: request.purchaseCurrency || 'USDC',
        destinationNetwork: request.destinationNetwork || 'base',
        destinationAddress: request.walletAddress,
        paymentAmount: request.paymentAmount,
        paymentCurrency: request.paymentCurrency || 'USD',
        paymentMethod: request.paymentMethod,
        country: request.country,
        subdivision: request.subdivision,
        redirectUrl: request.redirectUrl || `${window.location.origin}/deposit/coinbase`,
        partnerUserRef: request.partnerUserRef,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      console.log('[useCdpOnrampSession] Request payload:', payload);

      // Call the edge function instead of direct Coinbase API
      const { data, error: fnError } = await supabase.functions.invoke('cdp-onramp-session', {
        body: payload,
      });

      if (fnError) {
        console.error('[useCdpOnrampSession] Edge function error:', fnError);
        throw new Error(fnError.message || 'Edge function error');
      }

      if (data?.error) {
        console.error('[useCdpOnrampSession] API error:', data.error);
        throw new Error(data.error);
      }

      console.log('[useCdpOnrampSession] Session created successfully:', data);

      if (!data?.session?.onrampUrl) {
        throw new Error('No onramp URL in response');
      }

      setSession(data.session);
      setQuote(data.quote);

      return data as OnrampSessionResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      console.error('[useCdpOnrampSession] Error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setQuote(null);
    setError(null);
  }, []);

  return {
    session,
    quote,
    isLoading,
    error,
    createSession,
    reset,
  };
};
