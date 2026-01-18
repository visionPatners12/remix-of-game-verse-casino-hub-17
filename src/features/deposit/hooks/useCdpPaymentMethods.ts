import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserCountry } from '@/hooks/useUserCountry';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

// Mapping des IDs vers noms/descriptions localisés
const PAYMENT_METHOD_INFO: Record<string, { name: string; description: string }> = {
  CARD: { name: 'Debit Card', description: 'Visa, Mastercard' },
  APPLE_PAY: { name: 'Apple Pay', description: 'Express checkout' },
  ACH_BANK_ACCOUNT: { name: 'Bank Transfer', description: 'ACH (US only)' },
  FIAT_WALLET: { name: 'Coinbase Balance', description: 'Use your balance' },
  CRYPTO_ACCOUNT: { name: 'Coinbase Crypto', description: 'Pay with crypto' },
  SEPA: { name: 'SEPA Transfer', description: 'European bank transfer' },
};

export function useCdpPaymentMethods() {
  const { country: countryCode } = useUserCountry();

  return useQuery({
    queryKey: ['cdp-payment-methods', countryCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdp_supported_countries')
        .select('payment_methods, fiat_currencies')
        .eq('country_code', countryCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('[useCdpPaymentMethods] Country not found, using defaults:', countryCode);
        // Fallback: retourner CARD par défaut
        return { 
          methods: [{ id: 'CARD', ...PAYMENT_METHOD_INFO.CARD }], 
          currencies: ['USD'] as string[],
          countryCode,
        };
      }

      // Parse payment methods from DB (stored as array of objects with id)
      const rawMethods = data.payment_methods as { id: string }[] | string[];
      const methods: PaymentMethod[] = rawMethods.map(pm => {
        const id = typeof pm === 'string' ? pm : pm.id;
        return {
          id,
          ...(PAYMENT_METHOD_INFO[id] || { name: id, description: '' })
        };
      });

      // Parse fiat currencies
      const currencies = (data.fiat_currencies || ['USD']) as string[];

      return { 
        methods, 
        currencies,
        countryCode,
      };
    },
    staleTime: 1000 * 60 * 60, // Cache 1h
    enabled: !!countryCode,
  });
}
