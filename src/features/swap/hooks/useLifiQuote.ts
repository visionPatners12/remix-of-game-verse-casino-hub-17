// Hook for getting LI.FI swap quotes
import { useQuery } from '@tanstack/react-query';
import { getQuote, convertQuoteToRoute, type Route } from '@lifi/sdk';
import type { SwapQuote, SwapToken, SwapStep, SwapFees } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

interface UseLifiQuoteOptions {
  fromChainId: number;
  toChainId: number;
  fromToken: SwapToken | null;
  toToken: SwapToken | null;
  fromAmount: string;
  userAddress?: string;
  slippage?: number; // percentage, e.g., 0.5 for 0.5%
}

export function useLifiQuote({
  fromChainId,
  toChainId,
  fromToken,
  toToken,
  fromAmount,
  userAddress,
  slippage = 0.5,
}: UseLifiQuoteOptions) {
  // Debounce amount to avoid too many API calls
  const debouncedAmount = useDebounce(fromAmount, 500);
  
  // Check if we have enough info for a quote
  const canQuote = !!(
    fromToken &&
    toToken &&
    debouncedAmount &&
    Number(debouncedAmount) > 0 &&
    userAddress
  );

  const query = useQuery({
    queryKey: [
      'lifi-quote',
      fromChainId,
      toChainId,
      fromToken?.address,
      toToken?.address,
      debouncedAmount,
      userAddress,
      slippage,
    ],
    queryFn: async (): Promise<{ quote: SwapQuote; route: Route }> => {
      if (!fromToken || !toToken || !userAddress) {
        throw new Error('Missing required parameters');
      }

      const amountWei = BigInt(
        Math.floor(Number(debouncedAmount) * 10 ** fromToken.decimals)
      ).toString();

      const quoteResult = await getQuote({
        fromChain: fromChainId,
        toChain: toChainId,
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: amountWei,
        fromAddress: userAddress,
        slippage: slippage / 100, // Convert to decimal
      });

      // Convert quote to route for execution
      const route = convertQuoteToRoute(quoteResult);
      
      // Map to our quote format
      const quote = mapQuoteToSwapQuote(quoteResult, route, fromToken, toToken);
      return { quote, route };
    },
    enabled: canQuote,
    staleTime: 1000 * 15, // 15 seconds
    gcTime: 1000 * 60, // 1 minute
    retry: 1,
  });

  return {
    quote: query.data?.quote,
    route: query.data?.route,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    canQuote,
  };
}

// Helper to map LI.FI quote to our format
function mapQuoteToSwapQuote(
  quoteResult: any,
  route: Route,
  fromToken: SwapToken,
  toToken: SwapToken
): SwapQuote {
  const steps: SwapStep[] = route.steps.map(step => ({
    type: step.type === 'lifi' ? 'bridge' : 'swap',
    tool: step.tool,
    toolLogo: step.toolDetails?.logoURI,
    fromChain: step.action.fromChainId,
    toChain: step.action.toChainId,
    fromToken: {
      address: step.action.fromToken.address,
      symbol: step.action.fromToken.symbol,
      name: step.action.fromToken.name,
      decimals: step.action.fromToken.decimals,
      logoURI: step.action.fromToken.logoURI,
      chainId: step.action.fromChainId,
      priceUSD: step.action.fromToken.priceUSD,
    },
    toToken: {
      address: step.action.toToken.address,
      symbol: step.action.toToken.symbol,
      name: step.action.toToken.name,
      decimals: step.action.toToken.decimals,
      logoURI: step.action.toToken.logoURI,
      chainId: step.action.toChainId,
      priceUSD: step.action.toToken.priceUSD,
    },
    fromAmount: step.action.fromAmount,
    toAmount: step.estimate.toAmount,
  }));

  // Calculate exchange rate
  const fromAmountNum = Number(route.fromAmount) / 10 ** fromToken.decimals;
  const toAmountNum = Number(route.toAmount) / 10 ** toToken.decimals;
  const exchangeRate = fromAmountNum > 0 ? (toAmountNum / fromAmountNum).toFixed(6) : '0';

  // Calculate fees
  const gasCostUSD = route.gasCostUSD || '0';
  const fees: SwapFees = {
    gas: route.steps.reduce((acc, s) => acc + Number(s.estimate.gasCosts?.[0]?.amount || 0), 0).toString(),
    gasUSD: gasCostUSD,
    total: gasCostUSD,
    totalUSD: gasCostUSD,
  };

  // Get price impact from estimate (may not exist on all steps)
  const firstEstimate = route.steps[0]?.estimate as any;
  const priceImpact = firstEstimate?.priceImpact || '0';

  return {
    id: route.id,
    fromToken,
    toToken,
    fromAmount: route.fromAmount,
    toAmount: route.toAmount,
    toAmountMin: route.toAmountMin,
    exchangeRate,
    priceImpact: String(priceImpact),
    estimatedGas: fees.gas,
    estimatedTime: route.steps.reduce((acc, s) => acc + (s.estimate.executionDuration || 0), 0),
    route: { steps, tags: route.tags },
    fees,
  };
}
