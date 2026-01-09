// Hook for fetching LI.FI supported chains with optimized loading
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getChains, ChainType } from '@lifi/sdk';
import type { SwapChain } from '../types';
import { SUPPORTED_CHAIN_IDS, CHAIN_ICONS } from '@/config/lifi';

// Initial chains for instant display while fetching fresh data
const INITIAL_CHAINS: SwapChain[] = [
  {
    id: 137,
    name: 'Polygon',
    icon: 'polygon',
    nativeToken: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'POL',
      name: 'POL',
      decimals: 18,
      chainId: 137,
    },
  },
  {
    id: 1,
    name: 'Ethereum',
    icon: 'ethereum',
    nativeToken: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 1,
    },
  },
  {
    id: 42161,
    name: 'Arbitrum',
    icon: 'arbitrum',
    nativeToken: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 42161,
    },
  },
  {
    id: 10,
    name: 'Optimism',
    icon: 'optimism',
    nativeToken: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 10,
    },
  },
  {
    id: 8453,
    name: 'Base',
    icon: 'base',
    nativeToken: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 8453,
    },
  },
];

export function useLifiChains() {
  const query = useQuery({
    queryKey: ['lifi-chains'],
    queryFn: async () => {
      const chains = await getChains({ chainTypes: [ChainType.EVM] });
      
      // Filter to only supported chains and map to our format
      const supportedChains: SwapChain[] = chains
        .filter(chain => (SUPPORTED_CHAIN_IDS as number[]).includes(chain.id))
        .map(chain => ({
          id: chain.id,
          name: chain.name,
          icon: CHAIN_ICONS[chain.id] || 'ethereum',
          nativeToken: {
            address: chain.nativeToken.address,
            symbol: chain.nativeToken.symbol,
            name: chain.nativeToken.name,
            decimals: chain.nativeToken.decimals,
            logoURI: chain.nativeToken.logoURI,
            chainId: chain.id,
            priceUSD: chain.nativeToken.priceUSD,
          },
        }));
      
      return supportedChains;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    placeholderData: keepPreviousData,
    initialData: INITIAL_CHAINS, // Instant display
  });

  return {
    chains: query.data || INITIAL_CHAINS,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
