// Hook for fetching LI.FI tokens and balances with optimized loading
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { getTokens, getWalletBalances } from '@lifi/sdk';
import { useEffect } from 'react';
import type { SwapToken, SwapTokenWithBalance } from '../types';
import { SUPPORTED_CHAIN_IDS, DEFAULT_CHAIN_ID } from '@/config/lifi';

interface UseLifiTokensOptions {
  chainId?: number;
  walletAddress?: string;
}

export function useLifiTokens({ chainId, walletAddress }: UseLifiTokensOptions = {}) {
  const queryClient = useQueryClient();
  
  // Prefetch tokens for primary chain on mount
  useEffect(() => {
    // Prefetch default chain tokens in background
    queryClient.prefetchQuery({
      queryKey: ['lifi-tokens', DEFAULT_CHAIN_ID],
      queryFn: async () => {
        const result = await getTokens({ chains: [DEFAULT_CHAIN_ID] });
        const tokens: SwapToken[] = [];
        for (const [chain, chainTokens] of Object.entries(result.tokens)) {
          for (const token of chainTokens) {
            tokens.push({
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              logoURI: token.logoURI,
              chainId: Number(chain),
              priceUSD: token.priceUSD,
            });
          }
        }
        return tokens;
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  // Fetch all tokens for supported chains
  const tokensQuery = useQuery({
    queryKey: ['lifi-tokens', chainId],
    queryFn: async () => {
      const chainIds = chainId ? [chainId] : (SUPPORTED_CHAIN_IDS as number[]);
      const result = await getTokens({ chains: chainIds });
      
      const tokens: SwapToken[] = [];
      
      for (const [chain, chainTokens] of Object.entries(result.tokens)) {
        for (const token of chainTokens) {
          tokens.push({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoURI: token.logoURI,
            chainId: Number(chain),
            priceUSD: token.priceUSD,
          });
        }
      }
      
      return tokens;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    placeholderData: keepPreviousData, // Keep previous data while loading
  });

  // Fetch balances if wallet is connected using getWalletBalances
  const balancesQuery = useQuery({
    queryKey: ['lifi-balances', walletAddress, chainId],
    queryFn: async () => {
      if (!walletAddress) return [];
      
      const balancesMap = await getWalletBalances(walletAddress as `0x${string}`);
      
      const tokensWithBalance: SwapTokenWithBalance[] = [];
      const chainIds = chainId ? [chainId] : (SUPPORTED_CHAIN_IDS as number[]);
      
      // balancesMap is Record<chainId, WalletTokenExtended[]>
      for (const [chain, tokenAmounts] of Object.entries(balancesMap)) {
        const chainNum = Number(chain);
        // Filter to supported chains
        if (!chainIds.includes(chainNum)) continue;
        
        if (Array.isArray(tokenAmounts)) {
          for (const token of tokenAmounts) {
            const amount = token.amount ? String(token.amount) : '0';
            if (amount && BigInt(amount) > 0n) {
              tokensWithBalance.push({
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                logoURI: token.logoURI,
                chainId: chainNum,
                priceUSD: token.priceUSD,
                balance: amount,
                balanceUSD: token.priceUSD 
                  ? (Number(amount) / 10 ** token.decimals * Number(token.priceUSD)).toFixed(2)
                  : undefined,
              });
            }
          }
        }
      }
      
      // Sort by USD value
      return tokensWithBalance.sort((a, b) => {
        const aValue = Number(a.balanceUSD || 0);
        const bValue = Number(b.balanceUSD || 0);
        return bValue - aValue;
      });
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData, // Keep previous balances while refreshing
    refetchInterval: 60000, // Refresh every minute in background
  });

  return {
    tokens: tokensQuery.data || [],
    tokensWithBalance: balancesQuery.data || [],
    isLoadingTokens: tokensQuery.isLoading && !tokensQuery.data,
    isFetchingTokens: tokensQuery.isFetching,
    isLoadingBalances: balancesQuery.isLoading && !balancesQuery.data,
    isFetchingBalances: balancesQuery.isFetching,
    error: tokensQuery.error || balancesQuery.error,
    refetchBalances: balancesQuery.refetch,
  };
}

// Popular tokens to show first
export const POPULAR_TOKENS = [
  'USDT',
  'USDC',
  'USDC.e',
  'DAI',
  'WETH',
  'WBTC',
  'MATIC',
  'ETH',
  'WMATIC',
];

export function sortTokensByPopularity(tokens: SwapToken[]): SwapToken[] {
  return [...tokens].sort((a, b) => {
    const aIndex = POPULAR_TOKENS.indexOf(a.symbol);
    const bIndex = POPULAR_TOKENS.indexOf(b.symbol);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return a.symbol.localeCompare(b.symbol);
  });
}
