import { useQuery } from '@tanstack/react-query';
import { fetchUserNFTs } from '../services';
import { type ThirdWebNFTsResponse } from '../types';
import { useUnifiedWallet } from '@/features/wallet/hooks/core';

export function useNFTData() {
  const { address, isConnected } = useUnifiedWallet();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<ThirdWebNFTsResponse>({
    queryKey: ['nft-data', address],
    queryFn: () => {
      if (!address) {
        throw new Error('No wallet address available');
      }
      return fetchUserNFTs(address);
    },
    enabled: !!address && isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    nfts: data?.data || [],
    selectedNFT: data?.data?.[0] || null, // Premier NFT pour les détails
    isLoading,
    error: error as Error | null,
    refetch,
    hasNextPage: data?.hasNextPage || false,
    nextPageCursor: data?.nextPageCursor,
    isConnected,
    walletAddress: address,
  };
}