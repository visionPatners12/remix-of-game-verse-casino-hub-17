// Main Swap Widget component - Native design with optimized loading
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Loader2, AlertCircle, CheckCircle2, Wallet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TokenSelector } from './TokenSelector';
import { ChainSelector } from './ChainSelector';
import { SwapAmountInput } from './SwapAmountInput';
import { RoutePreview } from './RoutePreview';
import { SwapProgress } from './SwapProgress';
import { useLifiConfig, useLifiChains, useLifiTokens, useLifiQuote, useLifiExecution, useLifiAAExecution } from '../hooks';
import { formatTokenAmount } from '../utils/formatters';
import type { SwapToken } from '../types';
import { DEFAULT_CHAIN_ID } from '@/config/lifi';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

// Skeleton component for loading state
function SwapWidgetSkeleton() {
  return (
    <div className="flex flex-col min-h-full animate-pulse">
      {/* From Section Skeleton */}
      <section className="px-4 py-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-8 w-28 bg-muted rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-14 bg-muted rounded-xl" />
          </div>
          <div className="h-14 w-32 bg-muted rounded-2xl" />
        </div>
      </section>

      {/* Swap button skeleton */}
      <div className="relative h-0 z-10 flex justify-center">
        <div className="absolute -top-5 p-2.5 rounded-xl bg-muted border border-border h-10 w-10" />
      </div>

      {/* To Section Skeleton */}
      <section className="px-4 py-4 bg-card border-t border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-8 bg-muted rounded" />
          <div className="h-8 w-28 bg-muted rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-14 bg-muted rounded-xl" />
          </div>
          <div className="h-14 w-32 bg-muted rounded-2xl" />
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1 min-h-4" />

      {/* Button skeleton */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border/30 pb-safe">
        <div className="h-14 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export function SwapWidget() {
  const { address, isConnected, connectWallet, isAAWallet } = useUnifiedWallet();
  
  // Configure LI.FI SDK with wallet provider
  const { isReady: isLifiReady } = useLifiConfig();
  
  // Chain state
  const [fromChainId, setFromChainId] = useState<number>(DEFAULT_CHAIN_ID);
  const [toChainId, setToChainId] = useState<number>(DEFAULT_CHAIN_ID);
  
  // Token state
  const [fromToken, setFromToken] = useState<SwapToken | null>(null);
  const [toToken, setToToken] = useState<SwapToken | null>(null);
  
  // Amount state
  const [fromAmount, setFromAmount] = useState('');
  const [slippage] = useState(0.5);

  // Hooks
  const { chains, isLoading: isLoadingChains } = useLifiChains();
  const { tokens, tokensWithBalance, isLoadingTokens, refetchBalances } = useLifiTokens({
    walletAddress: address,
  });
  
  const { quote, route, isLoading: isLoadingQuote, isFetching, error: quoteError, canQuote } = useLifiQuote({
    fromChainId,
    toChainId,
    fromToken,
    toToken,
    fromAmount,
    userAddress: address,
    slippage,
  });

  // Both execution hooks - we choose based on wallet type
  const eoaExecution = useLifiExecution({
    onSuccess: () => {
      refetchBalances();
      setFromAmount('');
    },
  });

  const aaExecution = useLifiAAExecution({
    onSuccess: () => {
      refetchBalances();
      setFromAmount('');
    },
  });

  // Select active execution based on wallet type
  const execution = isAAWallet ? aaExecution : eoaExecution;
  const { status, steps, error: executionError, reset, isExecuting } = execution;

  // Get balances for selected tokens
  const fromTokenBalance = tokensWithBalance.find(
    t => t.address.toLowerCase() === fromToken?.address?.toLowerCase() && t.chainId === fromChainId
  );
  const toTokenBalance = tokensWithBalance.find(
    t => t.address.toLowerCase() === toToken?.address?.toLowerCase() && t.chainId === toChainId
  );

  // Calculate USD values
  const fromUsdValue = fromToken?.priceUSD && fromAmount
    ? (Number(fromAmount) * Number(fromToken.priceUSD)).toFixed(2)
    : undefined;
  const toUsdValue = quote?.toToken?.priceUSD && quote?.toAmount
    ? (Number(quote.toAmount) / 10 ** quote.toToken.decimals * Number(quote.toToken.priceUSD)).toFixed(2)
    : undefined;

  // Handle swap direction reverse
  const handleReverse = useCallback(() => {
    const tempChain = fromChainId;
    const tempToken = fromToken;
    
    setFromChainId(toChainId);
    setToChainId(tempChain);
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount('');
  }, [fromChainId, toChainId, fromToken, toToken]);

  // Handle swap execution
  const handleSwap = useCallback(async () => {
    if (!route || !address) return;
    
    if (isAAWallet) {
      await aaExecution.execute(route, address);
    } else {
      await eoaExecution.execute(route);
    }
  }, [route, address, isAAWallet, aaExecution, eoaExecution]);

  // Reset on success after delay
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(reset, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, reset]);

  // Determine button state
  const getButtonState = (): { text: string; disabled: boolean; variant: 'default' | 'outline' | 'destructive' } => {
    if (!isConnected) return { text: 'Connect Wallet', disabled: false, variant: 'default' };
    if (!isLifiReady) return { text: 'Initializing...', disabled: true, variant: 'outline' };
    if (isExecuting) return { text: 'Swapping...', disabled: true, variant: 'default' };
    if (status === 'success') return { text: 'Swap Complete!', disabled: true, variant: 'default' };
    if (!fromToken || !toToken) return { text: 'Select tokens', disabled: true, variant: 'outline' };
    if (!fromAmount || Number(fromAmount) === 0) return { text: 'Enter amount', disabled: true, variant: 'outline' };
    if (isLoadingQuote || isFetching) return { text: 'Getting quote...', disabled: true, variant: 'default' };
    if (quoteError) return { text: 'Quote unavailable', disabled: true, variant: 'destructive' };
    if (!quote) return { text: 'Get quote', disabled: true, variant: 'outline' };
    
    // Check balance
    if (fromTokenBalance && fromToken) {
      const amountWei = BigInt(Math.floor(Number(fromAmount) * 10 ** fromToken.decimals));
      if (amountWei > BigInt(fromTokenBalance.balance)) {
        return { text: 'Insufficient balance', disabled: true, variant: 'destructive' };
      }
    }
    
    return { text: 'Swap', disabled: false, variant: 'default' };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col min-h-full">
      {/* From Section */}
      <section className="px-4 py-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">From</span>
          <ChainSelector
            chains={chains}
            selectedChainId={fromChainId}
            onSelect={setFromChainId}
            isLoading={isLoadingChains}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SwapAmountInput
              value={fromAmount}
              onChange={setFromAmount}
              tokenBalance={fromTokenBalance}
              usdValue={fromUsdValue}
            />
          </div>
          <TokenSelector
            mode="from"
            tokens={tokens}
            tokensWithBalance={tokensWithBalance}
            selectedToken={fromToken}
            onSelect={setFromToken}
            chainId={fromChainId}
            isLoading={isLoadingTokens}
          />
        </div>
      </section>

      {/* Divider with swap button */}
      <div className="relative h-0 z-10 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReverse}
          className="absolute -top-5 p-2.5 rounded-xl bg-background border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <ArrowDownUp className="h-5 w-5" />
        </motion.button>
      </div>

      {/* To Section */}
      <section className="px-4 py-4 bg-card border-t border-border/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">To</span>
          <ChainSelector
            chains={chains}
            selectedChainId={toChainId}
            onSelect={setToChainId}
            isLoading={isLoadingChains}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SwapAmountInput
              value={quote ? formatTokenAmount(quote.toAmount, quote.toToken.decimals) : ''}
              onChange={() => {}}
              tokenBalance={toTokenBalance}
              usdValue={toUsdValue}
              readOnly
            />
          </div>
          <TokenSelector
            mode="to"
            tokens={tokens}
            tokensWithBalance={tokensWithBalance}
            selectedToken={toToken}
            onSelect={setToToken}
            chainId={toChainId}
            isLoading={isLoadingTokens}
          />
        </div>
      </section>

      {/* Route preview */}
      <AnimatePresence mode="wait">
        {(quote || isLoadingQuote || isFetching) && canQuote && (
          <motion.section
            key="route"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/30"
          >
            {quote ? (
              <RoutePreview quote={quote} isLoading={isFetching} />
            ) : (
              <div className="px-4 py-3 flex items-center justify-center gap-2 text-muted-foreground bg-muted/20">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Finding best route...</span>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Execution progress */}
      <AnimatePresence mode="wait">
        {(status === 'executing' || status === 'success') && steps.length > 0 && (
          <motion.section
            key="progress"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-t border-border/30"
          >
            <SwapProgress steps={steps} chainId={fromChainId} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence mode="wait">
        {(quoteError || executionError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 pt-3"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {executionError || (quoteError as Error)?.message || 'An error occurred'}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success display */}
      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="px-4 pt-3"
          >
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Swap completed successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1 min-h-4" />

      {/* Action button - sticky bottom */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border/30 pb-safe">
        <Button
          onClick={isConnected ? handleSwap : connectWallet}
          disabled={buttonState.disabled}
          variant={buttonState.variant}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl"
        >
          {isExecuting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {!isConnected && <Wallet className="mr-2 h-5 w-5" />}
          {status === 'success' && <CheckCircle2 className="mr-2 h-5 w-5" />}
          {buttonState.text}
        </Button>
      </div>
    </div>
  );
}
