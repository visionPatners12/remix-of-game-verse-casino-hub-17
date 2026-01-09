import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UnifiedModal } from '@/components/unified/UnifiedModal';
import { useTradingContext } from '../../providers/TradingProvider';
import { useOrderBook, extractBestPrices, simulateMarketOrder } from '../../hooks/useOrderBook';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { toast } from 'sonner';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { TokenUSDC, TokenMATIC } from '@web3icons/react';

import { PolymarketSelectionCard } from './PolymarketSelectionCard';
import { PolymarketStakeInput } from './PolymarketStakeInput';
import { PolymarketSummaryCard } from './PolymarketSummaryCard';
import { PolymarketCTAButton } from './PolymarketCTAButton';
import { QuickStakePills } from '@/features/ticket-slip/components/mobile/redesign';

const POLYGON_CHAIN_ID = 137;

export function BuyModal() {
  const {
    buyModalState,
    closeBuyModal,
    isReady,
    isInitializing,
    placeOrder,
    isPlacing,
    orderError,
    sessionError,
    initializeTradingSession,
  } = useTradingContext();

  // Use unified wallet for consistent connection state
  const { 
    isConnected, 
    isRecoveringSession, 
    needsPrivyReconnection,
    connectWallet 
  } = useUnifiedWallet();

  // Get USDC balance on Polygon
  const { tokensByChain } = useWalletTokensThirdWeb();
  const polygonTokens = tokensByChain[POLYGON_CHAIN_ID]?.tokens || [];
  const usdcToken = polygonTokens.find(t => t.symbol.toUpperCase() === 'USDC');
  const usdcBalance = usdcToken?.balance ? parseFloat(usdcToken.balance) : 0;
  const usdcBalanceFormatted = usdcBalance.toFixed(2);

  const [amount, setAmount] = useState<string>('25');

  const { data: orderBook } = useOrderBook(buyModalState?.tokenId);

  const orderBookPrices = useMemo(() => {
    if (!orderBook) return null;
    return extractBestPrices(orderBook);
  }, [orderBook]);

  const handleConfirm = useCallback(async () => {
    if (!buyModalState) return;

    // If not connected or needs reconnection, open Privy login modal
    if (!isConnected || needsPrivyReconnection) {
      connectWallet();
      return;
    }

    // If session not ready, initialize it
    if (!isReady && !isInitializing) {
      toast.info('Setting up trading session...');
      await initializeTradingSession();
      return;
    }

    // Validate amount
    const size = parseFloat(amount);
    if (isNaN(size) || size < 1) {
      toast.error('Minimum: $1');
      return;
    }

    const dynamicPrice = orderBookPrices?.bestAsk ?? buyModalState?.buyPrice ?? buyModalState?.currentPrice ?? 0;

    const result = await placeOrder({
      tokenId: buyModalState.tokenId,
      price: dynamicPrice,
      size,
      side: buyModalState.side,
      negRisk: buyModalState.negRisk,
    });

    if (result) {
      toast.success('Bet placed!');
      closeBuyModal();
      setAmount('25');
    } else if (orderError) {
      toast.error(orderError);
    }
  }, [buyModalState, amount, placeOrder, closeBuyModal, isConnected, needsPrivyReconnection, connectWallet, orderBookPrices, isReady, isInitializing, initializeTradingSession, orderError]);

  const calculations = useMemo(() => {
    if (!buyModalState || !orderBook) return null;
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) return null;
    
    const simulation = simulateMarketOrder(orderBook.asks, amountNum);
    const avgPrice = simulation.avgPrice;
    const decimalOdds = avgPrice > 0 ? 1 / avgPrice : 1;
    const probability = avgPrice > 0 ? avgPrice * 100 : 0;
    const payout = simulation.shares;
    const profit = payout - amountNum;
    const profitPercent = amountNum > 0 ? (profit / amountNum * 100) : 0;
    
    return { 
      decimalOdds,
      probability,
      payout,
      profit,
      profitPercent,
      isValid: amountNum >= 1,
    };
  }, [amount, buyModalState, orderBook]);

  if (!buyModalState) return null;

  const amountNum = parseFloat(amount) || 0;
  const isLoading = isPlacing || isInitializing;

  return (
    <UnifiedModal
      isOpen={buyModalState.isOpen}
      onClose={closeBuyModal}
      size="sm"
    >
      <motion.div 
        className="flex flex-col gap-4 font-sans"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header with event info */}
        <div className="flex items-start gap-3">
          {buyModalState.eventImage && (
            <img 
              src={buyModalState.eventImage} 
              alt=""
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-muted"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm text-muted-foreground">
              {buyModalState.eventTitle || 'Event'}
            </h3>
            <p className="text-base font-semibold text-foreground mt-0.5">
              {buyModalState.marketTitle || ''}
            </p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Available Balance</span>
          <div className="flex items-center gap-2">
            <TokenUSDC variant="branded" size={20} />
            <span className="font-semibold">{usdcBalanceFormatted}</span>
            <span className="text-sm text-muted-foreground">USDC</span>
            <div className="flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded-full ml-1">
              <TokenMATIC variant="branded" size={12} />
              <span className="text-xs text-purple-400">Polygon</span>
            </div>
          </div>
        </div>

        {/* Selection Card with outcome and odds */}
        <PolymarketSelectionCard
          outcome={buyModalState.outcome || 'YES'}
          decimalOdds={calculations?.decimalOdds ?? 1}
          probability={calculations?.probability}
        />

        {/* Quick Stake Pills */}
        <QuickStakePills
          currentStake={amountNum}
          onSelect={(val) => setAmount(val.toString())}
        />

        {/* Stake Input */}
        <PolymarketStakeInput
          value={amountNum}
          onChange={(val) => setAmount(val.toString())}
          minBet={1}
          error={amountNum > 0 && amountNum < 1 ? 'Minimum $1' : undefined}
        />

        {/* Summary Card */}
        {calculations && (
          <PolymarketSummaryCard
            decimalOdds={calculations.decimalOdds}
            payout={calculations.payout}
            profit={calculations.profit}
            profitPercent={calculations.profitPercent}
            outcome={buyModalState.outcome || 'YES'}
          />
        )}

        {/* Error Display */}
        {(sessionError || orderError) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm">
            {sessionError || orderError}
          </div>
        )}

        {/* CTA Button */}
        <PolymarketCTAButton
          onConfirm={handleConfirm}
          amount={amountNum}
          isLoading={isLoading}
          isConnected={isConnected}
          isRecovering={isRecoveringSession}
          needsReconnection={needsPrivyReconnection}
          outcome={buyModalState.outcome || 'YES'}
          disabled={!calculations?.isValid && isConnected}
        />
      </motion.div>
    </UnifiedModal>
  );
}
