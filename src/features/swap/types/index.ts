// Swap feature types

export interface SwapToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  priceUSD?: string;
}

export interface SwapTokenWithBalance extends SwapToken {
  balance: string;
  balanceUSD?: string;
}

export interface SwapChain {
  id: number;
  name: string;
  icon: string;
  nativeToken: SwapToken;
}

export interface SwapQuote {
  id: string;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  exchangeRate: string;
  priceImpact: string;
  estimatedGas: string;
  estimatedTime: number; // in seconds
  route: SwapRoute;
  fees: SwapFees;
}

export interface SwapRoute {
  steps: SwapStep[];
  tags?: string[];
}

export interface SwapStep {
  type: 'swap' | 'bridge' | 'cross';
  tool: string;
  toolLogo?: string;
  fromChain: number;
  toChain: number;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: string;
  toAmount: string;
}

export interface SwapFees {
  gas: string;
  gasUSD: string;
  bridge?: string;
  bridgeUSD?: string;
  total: string;
  totalUSD: string;
}

export type SwapStatus = 
  | 'idle'
  | 'loading-quote'
  | 'quote-ready'
  | 'confirming'
  | 'executing'
  | 'waiting-signature'
  | 'pending'
  | 'success'
  | 'error';

export interface SwapExecutionStep {
  id: string;
  type: 'approval' | 'swap' | 'bridge';
  status: 'pending' | 'active' | 'completed' | 'failed';
  txHash?: string;
  message: string;
}

export interface SwapState {
  status: SwapStatus;
  fromChainId: number;
  toChainId: number;
  fromToken: SwapToken | null;
  toToken: SwapToken | null;
  fromAmount: string;
  toAmount: string;
  quote: SwapQuote | null;
  executionSteps: SwapExecutionStep[];
  error: string | null;
  txHash: string | null;
}

export interface SwapFormValues {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  slippage: number;
}
