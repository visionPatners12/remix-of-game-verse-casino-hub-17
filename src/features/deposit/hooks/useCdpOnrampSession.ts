import { useState, useCallback } from 'react';

const CDP_ONRAMP_URL = 'https://api.cdp.coinbase.com/platform/v2/onramp/sessions';

export interface OnrampSessionRequest {
  jwtToken: string;
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
      console.log('[useCdpOnrampSession] Creating session with params:', {
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

      const response = await fetch(CDP_ONRAMP_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[useCdpOnrampSession] API error:', response.status, data);
        const errorMessage = data?.error?.message || data?.message || `API error: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('[useCdpOnrampSession] Session created successfully:', data);

      if (!data.session?.onrampUrl) {
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
