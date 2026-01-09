// Hook pour récupérer le solde USDC.e sur Polygon
import { useBalance } from 'wagmi';
import { polygon } from 'viem/chains';
import { USDC_E_ADDRESS } from '../constants/contracts';

export function useUsdcBalance(address?: string) {
  const { data, isLoading, refetch } = useBalance({
    address: address as `0x${string}`,
    token: USDC_E_ADDRESS as `0x${string}`,
    chainId: polygon.id,
    query: {
      enabled: !!address,
    },
  });

  const formatted = data?.formatted ? parseFloat(data.formatted) : 0;

  return {
    balance: formatted,
    balanceFormatted: formatted.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }),
    isLoading,
    refetch,
  };
}
