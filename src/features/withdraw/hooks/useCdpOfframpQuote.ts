import { useState, useCallback } from 'react';

const CDP_OFFRAMP_API_URL = 'https://api.developer.coinbase.com/onramp/v1/sell/quote';

export interface OfframpQuoteRequest {
  jwtToken: string;
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
  amount: string;
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
      console.log('[useCdpOfframpQuote] Creating offramp quote...');
      
      // Build request payload
      const payload: Record<string, string> = {
        sell_currency: request.sellCurrency,
        sell_network: request.sellNetwork,
        sell_amount: request.sellAmount,
        cashout_currency: request.cashoutCurrency,
        payment_method: request.paymentMethod,
        country: request.country,
        source_address: request.sourceAddress,
        redirect_url: request.redirectUrl,
        partner_user_ref: request.partnerUserRef,
      };

      // Add subdivision if provided (required for US)
      if (request.subdivision) {
        payload.subdivision = request.subdivision;
      }

      console.log('[useCdpOfframpQuote] Request payload:', payload);

      const response = await fetch(CDP_OFFRAMP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[useCdpOfframpQuote] API error:', data);
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
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
