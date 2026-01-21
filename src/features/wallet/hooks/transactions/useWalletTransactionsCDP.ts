import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedWallet } from '../core/useUnifiedWallet';
import { CDPTransaction, TransformedCDPTransaction, transformCDPTransaction } from '../../types/cdpTransactions';
import { DEFAULT_CHAIN_ID, CHAIN_SLUGS, SUPPORTED_CHAINS } from '@/config/chains';

// Map chain IDs to CDP network IDs
const CDP_NETWORK_MAP: Record<number, string> = {
  8453: 'base-mainnet',      // Base
  137: 'polygon-mainnet',    // Polygon
  1: 'ethereum-mainnet',     // Ethereum
  42161: 'arbitrum-mainnet', // Arbitrum
  10: 'optimism-mainnet',    // Optimism
};

export const useWalletTransactionsCDP = (initialChainId?: number) => {
  const [chainId, setChainId] = useState<number>(initialChainId || DEFAULT_CHAIN_ID);
  const { address, isConnected } = useUnifiedWallet();
  const queryClient = useQueryClient();

  const networkId = CDP_NETWORK_MAP[chainId] || 'base-mainnet';

  // Get current user
  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  };

  // Sync transactions from CDP API to Supabase
  const syncTransactions = async () => {
    if (!address || !isConnected) return null;

    console.log('[CDP Sync] Starting sync for address:', address, 'network:', networkId);

    const { data, error } = await supabase.functions.invoke('cdp-address-tx-history', {
      body: { 
        networkId, 
        addressId: address 
      }
    });

    if (error) {
      console.error('[CDP Sync] Error:', error);
      throw error;
    }

    console.log('[CDP Sync] Synced transactions:', data?.data?.length || 0);
    return data;
  };

  // Fetch transactions from database (source of truth)
  const fetchFromDatabase = async (): Promise<TransformedCDPTransaction[]> => {
    const userId = await getUserId();
    if (!userId || !address) return [];

    console.log('[CDP DB] Fetching transactions for user:', userId, 'network:', networkId);

    const { data, error } = await supabase
      .from('cdp_address_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('network_id', networkId)
      .order('block_timestamp', { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      console.error('[CDP DB] Error:', error);
      throw error;
    }

    console.log('[CDP DB] Found transactions:', data?.length || 0);

    // Transform to UI format
    return (data || []).map((tx) => 
      transformCDPTransaction(tx as CDPTransaction, address)
    );
  };

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: syncTransactions,
    onSuccess: () => {
      // Invalidate query to refetch from DB
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions-cdp', address, networkId] });
    },
    onError: (error) => {
      console.error('[CDP Sync] Mutation error:', error);
    }
  });

  // Main query from database
  const query = useQuery({
    queryKey: ['wallet-transactions-cdp', address, networkId],
    queryFn: fetchFromDatabase,
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Realtime subscription for automatic updates
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const userId = await getUserId();
      if (!userId) return;

      channel = supabase
        .channel(`cdp-transactions-realtime-${networkId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cdp_address_transactions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('[CDP Realtime] Change detected:', payload.eventType);
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions-cdp', address, networkId] });
          }
        )
        .subscribe((status) => {
          console.log('[CDP Realtime] Subscription status:', status);
        });
    };

    if (isConnected && address) {
      setupSubscription();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isConnected, address, networkId, queryClient]);

  // Auto-sync on mount or chain change
  useEffect(() => {
    if (isConnected && address && !syncMutation.isPending) {
      syncMutation.mutate();
    }
  }, [isConnected, address, networkId]);

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    sync: () => syncMutation.mutate(),
    isSyncing: syncMutation.isPending,
    chainId,
    setChainId,
    networkId,
  };
};
