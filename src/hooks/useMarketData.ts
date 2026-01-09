
import { useGame, useActiveMarkets } from '@azuro-org/sdk';
import { useEffect, useRef } from 'react';
import type { MarketData } from '@/types';

// Types chainId supportés par Azuro
type SupportedChainId = 137 | 100 | 80002 | 88888 | 88882 | 8453 | 84532;

interface UseMarketDataOptions {
  gameId: string;
  chainId?: SupportedChainId;
  refetchInterval?: number;
}

export function useMarketData({ 
  gameId, 
  chainId = 137 as SupportedChainId, 
  refetchInterval = 0 // Désactivé par défaut
}: UseMarketDataOptions): MarketData {

  // Récupération des données du match
  const { 
    data: game = null, 
    isFetching: isGameLoading, 
    error: gameError,
    refetch: refetchGame 
  } = useGame({
    gameId,
    chainId: chainId as SupportedChainId,
    query: {
      staleTime: 30000, // Cache pendant 30 secondes
      refetchOnWindowFocus: false,
    }
  });

  // Récupération des marchés actifs
  const { 
    data: markets = [], 
    isFetching: isMarketsLoading, 
    error: marketsError,
    refetch: refetchMarkets 
  } = useActiveMarkets({
    gameId,
    chainId: chainId as SupportedChainId,
    query: {
      staleTime: 30000, // Cache pendant 30 secondes
      refetchOnWindowFocus: false,
    }
  });

  // Fonction de refetch globale
  const refetch = () => {
    refetchGame();
    refetchMarkets();
  };

  return {
    game,
    markets,
    isLoading: isGameLoading || isMarketsLoading,
    error: gameError || marketsError || null,
    refetch,
  };
}
