import { useQuery } from '@tanstack/react-query';
import { useUnifiedWallet } from '../core/useUnifiedWallet';
import { WalletToken, TokensByChain } from '../../types';
import { logger } from '@/utils/logger';
import { SUPPORTED_CHAINS, getChainConfig } from '@/components/ui/chain-icon';

const CLIENT_ID = "6141f9975c6b19903ca9699e9d9fc629";

interface ThirdWebTokenData {
  chain_id: number;
  token_address: string;
  balance: string;
  decimals?: number;
  name?: string;
  symbol?: string;
  price_data?: {
    price_usd?: number;
    usd_value?: number;
    circulating_supply?: number;
    market_cap_usd?: number;
    percent_change_24h?: number;
    price_timestamp?: string;
    total_supply?: number;
    volume_24h_usd?: number;
  };
}

interface ThirdWebTokenResponse {
  data?: ThirdWebTokenData[];
  result?: ThirdWebTokenData[];
  tokens?: ThirdWebTokenData[];
}

const formatUnits = (balance: string, decimals: number): string => {
  const balanceNum = parseFloat(balance);
  const divisor = Math.pow(10, decimals);
  const formatted = balanceNum / divisor;
  return formatted.toFixed(6).replace(/\.?0+$/, '');
};

const transformThirdWebToWalletToken = (tokenData: ThirdWebTokenData, chainId: number): WalletToken => {
  const decimals = tokenData.decimals || 18;
  const name = tokenData.name || 'Unknown Token';
  const symbol = tokenData.symbol || 'UNKNOWN';
  const chainConfig = getChainConfig(chainId);
  
  const balance = formatUnits(tokenData.balance, decimals);
  
  const usdValue = tokenData.price_data?.usd_value || 0;
  const priceUsd = tokenData.price_data?.price_usd || 0;
  
  let tokenType = 'ERC-20';
  if (tokenData.token_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    tokenType = 'Native';
  } else if (chainId === 56) {
    tokenType = 'BEP-20';
  }

  return {
    name,
    symbol,
    decimals,
    balance,
    formattedBalance: `${balance} ${symbol}`,
    quote: usdValue,
    quoteRate: priceUsd,
    logoUrl: undefined,
    contractAddress: tokenData.token_address,
    type: tokenType,
    chainId,
    chainName: chainConfig?.name || 'Unknown'
  };
};

const fetchTokensForChain = async (walletAddress: string, chainId: number): Promise<WalletToken[]> => {
  const url = new URL('https://1.insight.thirdweb.com/v1/tokens');
  url.searchParams.set('chain_id', chainId.toString());
  url.searchParams.set('owner_address', walletAddress);
  url.searchParams.set('include_native', 'true');
  url.searchParams.set('metadata', 'true');
  url.searchParams.set('limit', '50');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-client-id': CLIENT_ID,
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    logger.warn(`ThirdWeb API error for chain ${chainId}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  const tokensArray = data.data || data.result || data.tokens || [];

  return tokensArray
    .filter((token: ThirdWebTokenData) => {
      try {
        const decimals = token.decimals || 18;
        const formattedBalance = parseFloat(formatUnits(token.balance, decimals));
        return formattedBalance > 0;
      } catch {
        return false;
      }
    })
    .map((token: ThirdWebTokenData) => {
      try {
        return transformThirdWebToWalletToken(token, chainId);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as WalletToken[];
};

const groupTokensByChain = (tokens: WalletToken[]): TokensByChain => {
  return tokens.reduce((acc, token) => {
    const key = token.chainId;
    if (!acc[key]) {
      acc[key] = { 
        chainName: token.chainName, 
        tokens: [],
        totalValue: 0
      };
    }
    acc[key].tokens.push(token);
    acc[key].totalValue += token.quote;
    return acc;
  }, {} as TokensByChain);
};

interface UseWalletTokensThirdWebResponse {
  tokens: WalletToken[];
  tokensByChain: TokensByChain;
  totalValue: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  walletAddress: string | null;
  isConnected: boolean;
}

export function useWalletTokensThirdWeb(): UseWalletTokensThirdWebResponse {
  const { walletAddress, isWalletConnected } = useUnifiedWallet();

  const {
    data: tokensData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['wallet-tokens-thirdweb-multichain', walletAddress],
    queryFn: async (): Promise<{ tokens: WalletToken[]; tokensByChain: TokensByChain; totalValue: number }> => {
      if (!walletAddress) {
        return { tokens: [], tokensByChain: {}, totalValue: 0 };
      }

      // Fetch tokens from all supported chains in parallel
      const results = await Promise.allSettled(
        SUPPORTED_CHAINS.map(chain => fetchTokensForChain(walletAddress, chain.id))
      );

      // Combine all tokens
      const allTokens: WalletToken[] = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allTokens.push(...result.value);
        }
      });

      // Sort by value (highest first)
      allTokens.sort((a, b) => b.quote - a.quote);

      const tokensByChain = groupTokensByChain(allTokens);
      const totalValue = allTokens.reduce((sum, token) => sum + token.quote, 0);

      logger.debug('[ThirdWeb] Loaded tokens from all chains:', {
        totalCount: allTokens.length,
        totalValue,
        byChain: Object.entries(tokensByChain).map(([chainId, data]) => 
          `${data.chainName}: ${data.tokens.length} tokens`
        )
      });

      return { tokens: allTokens, tokensByChain, totalValue };
    },
    enabled: !!walletAddress && isWalletConnected,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchInterval: () => {
      return document.visibilityState === 'visible' ? 120000 : false;
    },
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: 2
  });

  return {
    tokens: tokensData?.tokens || [],
    tokensByChain: tokensData?.tokensByChain || {},
    totalValue: tokensData?.totalValue || 0,
    isLoading,
    error: error?.message || null,
    refetch,
    walletAddress,
    isConnected: isWalletConnected,
  };
}
