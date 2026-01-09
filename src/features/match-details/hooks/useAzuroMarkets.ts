import { useActiveMarkets } from '@azuro-org/sdk';
import { logger } from '@/utils/logger';

export function useAzuroMarkets(azuroGameId: string | null | undefined) {
  const { 
    data: markets = [], 
    isFetching: marketsLoading,
    error: marketsError
  } = useActiveMarkets({
    gameId: azuroGameId || '',
    chainId: 137,
    query: { 
      enabled: !!azuroGameId,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: false
    }
  });

  return {
    markets,
    isLoading: marketsLoading,
    error: marketsError,
  };
}
