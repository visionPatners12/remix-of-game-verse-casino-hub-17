import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OfframpQuoteRequest {
  sellCurrency: string;        // "USDC"
  sellNetwork: string;         // "base"
  sellAmount: string;          // "100.00"
  cashoutCurrency: string;     // "USD"
  paymentMethod: string;       // "ACH_BANK_ACCOUNT"
  country: string;             // "US"
  subdivision?: string;        // "NY" (required if US)
  sourceAddress: string;       // Wallet address
  redirectUrl: string;         // Callback URL
  partnerUserRef: string;      // User ID
}

export interface OfframpQuoteAmount {
  value: string;
  currency: string;
}

export interface OfframpQuoteResponse {
  cashout_total: OfframpQuoteAmount;
  cashout_subtotal: OfframpQuoteAmount;
  sell_amount: OfframpQuoteAmount;
  coinbase_fee: OfframpQuoteAmount;
  quote_id: string;
  offramp_url?: string;
}

interface UseCdpOfframpQuoteResult {
  quote: OfframpQuoteResponse | null;
  isLoading: boolean;
  error: string | null;
  createQuote: (request: OfframpQuoteRequest) => Promise<OfframpQuoteResponse | null>;
  reset: () => void;
}

export const useCdpOfframpQuote = (): UseCdpOfframpQuoteResult => {
  const [quote, setQuote] = useState<OfframpQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuote = useCallback(async (request: OfframpQuoteRequest): Promise<OfframpQuoteResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCdpOfframpQuote] Creating offramp quote via Edge Function...');
      
      // Build request payload for the Edge Function
      const payload = {
        sellCurrency: request.sellCurrency,
        sellNetwork: request.sellNetwork,
        sellAmount: request.sellAmount,
        cashoutCurrency: request.cashoutCurrency,
        paymentMethod: request.paymentMethod,
        country: request.country,
        subdivision: request.subdivision,
        sourceAddress: request.sourceAddress,
        redirectUrl: request.redirectUrl,
        partnerUserRef: request.partnerUserRef,
      };

      console.log('[useCdpOfframpQuote] Request payload:', payload);

      const { data, error: fnError } = await supabase.functions.invoke('cdp-offramp-quote', {
        body: payload,
      });

      if (fnError) {
        console.error('[useCdpOfframpQuote] Function error:', fnError);
        throw new Error(fnError.message || 'Failed to invoke edge function');
      }

      if (data?.error) {
        console.error('[useCdpOfframpQuote] Response error:', data.error);
        throw new Error(data.error);
      }

      console.log('[useCdpOfframpQuote] Quote received:', data);
      setQuote(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create offramp quote';
      console.error('[useCdpOfframpQuote] Error:', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    quote,
    isLoading,
    error,
    createQuote,
    reset,
  };
};
