// Hook for placing orders on Polymarket
// Uses ClobClient for real order execution

import { useCallback, useState } from 'react';
import { Side, OrderType } from '@polymarket/clob-client';
import type { OrderParams } from '../types/trading';
import { logger } from '@/utils/logger';

interface UseTradingSessionReturn {
  clobClient: any;
  isReady: boolean;
  safeAddress: string | null;
}

export function usePolymarketOrder(session?: UseTradingSessionReturn) {
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const placeOrder = useCallback(async (params: OrderParams): Promise<string | null> => {
    const clobClient = session?.clobClient;
    const isReady = session?.isReady ?? false;

    if (!isReady || !clobClient) {
      setOrderError('Trading session not ready. Please wait for initialization.');
      return null;
    }

    setIsPlacing(true);
    setOrderError(null);

    try {
      logger.info('[Order] Placing order:', params);

      const side = params.side === 'BUY' ? Side.BUY : Side.SELL;

      // Options for the market (negRisk flag)
      const options = {
        negRisk: params.negRisk,
      };

      // Determine if this is a market order or limit order
      // Market order: price is at extreme (0.99 for buy, 0.01 for sell) or not specified
      const isMarketOrder = params.price <= 0.01 || params.price >= 0.99;

      if (isMarketOrder) {
        // Market order using FOK (Fill or Kill)
        const marketOrder = {
          tokenID: params.tokenId,
          amount: params.size, // Amount in USDC for BUY
          side,
          feeRateBps: 0,
        };

        logger.info('[Order] Placing market order (FOK):', marketOrder);

        const response = await clobClient.createAndPostMarketOrder(
          marketOrder,
          options,
          OrderType.FOK
        );

        logger.info('[Order] Market order response:', response);
        return response?.orderID || response?.id || 'success';

      } else {
        // Limit order using GTC (Good Till Cancel)
        const limitOrder = {
          tokenID: params.tokenId,
          price: params.price,
          size: params.size,
          side,
          feeRateBps: 0,
        };

        logger.info('[Order] Placing limit order (GTC):', limitOrder);

        const response = await clobClient.createAndPostOrder(
          limitOrder,
          options,
          OrderType.GTC
        );

        logger.info('[Order] Limit order response:', response);
        return response?.orderID || response?.id || 'success';
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      logger.error('[Order] Error:', message, err);
      setOrderError(message);
      return null;
    } finally {
      setIsPlacing(false);
    }
  }, [session?.clobClient, session?.isReady]);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    const clobClient = session?.clobClient;
    const isReady = session?.isReady ?? false;

    if (!isReady || !clobClient) {
      setOrderError('Trading session not ready');
      return false;
    }

    try {
      logger.info('[Order] Cancelling order:', orderId);
      
      await clobClient.cancelOrder({ orderID: orderId });
      
      logger.info('[Order] Order cancelled successfully');
      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      logger.error('[Order] Cancel error:', message);
      setOrderError(message);
      return false;
    }
  }, [session?.clobClient, session?.isReady]);

  return {
    placeOrder,
    cancelOrder,
    isPlacing,
    orderError,
    clearError: () => setOrderError(null),
  };
}
