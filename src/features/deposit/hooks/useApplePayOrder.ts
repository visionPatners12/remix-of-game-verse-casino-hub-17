import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ApplePayOrderParams {
  destinationAddress: string;
  email: string;
  phoneNumber: string;
  paymentAmount: string;
  partnerUserRef?: string;
  partnerOrderRef?: string;
}

export interface ApplePayOrderResponse {
  order: {
    orderId: string;
    paymentTotal: string;
    paymentSubtotal: string;
    paymentCurrency: string;
    paymentMethod: string;
    purchaseAmount: string;
    purchaseCurrency: string;
    fees: Array<{
      type: string;
      amount: string;
      currency: string;
    }>;
    exchangeRate: string;
    destinationAddress: string;
    destinationNetwork: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    txHash?: string;
    partnerUserRef?: string;
  };
  paymentLink: {
    url: string;
    paymentLinkType: string;
  };
}

export function useApplePayOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (params: ApplePayOrderParams): Promise<ApplePayOrderResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useApplePayOrder] Creating Apple Pay order:', params);

      const { data, error: fnError } = await supabase.functions.invoke('cdp-session-token', {
        body: {
          endpoint: 'apple-pay-order',
          body: params,
        },
      });

      if (fnError) {
        console.error('[useApplePayOrder] Function error:', fnError);
        throw new Error(fnError.message || 'Failed to create Apple Pay order');
      }

      if (data?.error) {
        console.error('[useApplePayOrder] API error:', data);
        throw new Error(data.error || 'Coinbase API error');
      }

      console.log('[useApplePayOrder] Order created:', data);
      return data as ApplePayOrderResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create Apple Pay order';
      console.error('[useApplePayOrder] Error:', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createOrder,
    isLoading,
    error,
  };
}
