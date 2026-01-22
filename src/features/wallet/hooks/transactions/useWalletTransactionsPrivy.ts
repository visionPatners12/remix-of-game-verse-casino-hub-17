import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedWallet } from '../core/useUnifiedWallet';

export interface PrivyTransaction {
  id: string;
  hash: string;
  status: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  from_address: string | null;
  to_address: string | null;
  network: string;
  created_at: string;
  fee: number;
  confirmations: number;
}

interface UseWalletTransactionsPrivyOptions {
  chain?: string;
  asset?: string;
  limit?: number;
}

export const useWalletTransactionsPrivy = (options?: UseWalletTransactionsPrivyOptions) => {
  const { address, isConnected } = useUnifiedWallet();
  const chain = options?.chain || 'base';
  const asset = options?.asset || 'usdc';
  const limit = options?.limit || 50;

  const fetchTransactions = async (): Promise<PrivyTransaction[]> => {
    if (!address || !isConnected) {
      return [];
    }

    console.log(`📡 Fetching Privy transactions for ${address} on ${chain}`);

    const { data, error } = await supabase.functions.invoke('privy-transactions', {
      body: { 
        wallet_id: address,
        chain,
        asset,
        limit,
      }
    });

    if (error) {
      console.error('❌ Error fetching Privy transactions:', error);
      throw error;
    }

    if (!data.success) {
      console.error('❌ Privy API error:', data.error);
      throw new Error(data.error || 'Failed to fetch transactions');
    }

    console.log(`✅ Got ${data.transactions?.length || 0} transactions`);
    return data.transactions || [];
  };

  return useQuery({
    queryKey: ['wallet-transactions-privy', address, chain, asset],
    queryFn: fetchTransactions,
    enabled: !!address && isConnected,
    staleTime: 60000,
    refetchInterval: () => document.visibilityState === 'visible' ? 120000 : false,
  });
};
