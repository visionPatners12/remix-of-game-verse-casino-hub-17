// Trading context provider for Polymarket

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ClobClient } from '@polymarket/clob-client';
import { useTradingSession } from '../hooks/useTradingSession';
import { usePolymarketOrder } from '../hooks/usePolymarketOrder';
import type { TradingSession, TradingStep, OrderParams, BuyModalParams, BuyModalState } from '../types/trading';
import type { ApiKeyCreds } from '../hooks/useClobClient';

interface TradingContextValue {
  // Session
  tradingSession: TradingSession | null;
  currentStep: TradingStep;
  error: string | null;
  isReady: boolean;
  isInitializing: boolean;
  
  // Clients and state
  clobClient: ClobClient | null;
  safeAddress: string | null;
  credentials: ApiKeyCreds | null;
  allApproved: boolean;
  
  // Actions
  initializeTradingSession: () => Promise<void>;
  endTradingSession: () => void;
  
  // Trading
  placeOrder: (params: OrderParams) => Promise<string | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  isPlacing: boolean;
  orderError: string | null;
  
  // Modal
  openBuyModal: (params: BuyModalParams) => void;
  closeBuyModal: () => void;
  buyModalState: BuyModalState | null;
  
  // Wallet connection (unified with Azuro)
  login: () => void;
  isConnected: boolean;
  ready: boolean;
  
  // Session error feedback
  sessionError: string | null;
}

const TradingContext = createContext<TradingContextValue | null>(null);

export function useTradingContext() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within TradingProvider');
  }
  return context;
}

interface TradingProviderProps {
  children: ReactNode;
}

export function TradingProvider({ children }: TradingProviderProps) {
  const session = useTradingSession();
  
  // Pass session to order hook for ClobClient access
  const order = usePolymarketOrder({
    clobClient: session.clobClient,
    isReady: session.isReady,
    safeAddress: session.safeAddress,
  });
  
  const [buyModalState, setBuyModalState] = useState<BuyModalState | null>(null);

  const openBuyModal = useCallback((params: BuyModalParams) => {
    setBuyModalState({ ...params, isOpen: true });
  }, []);

  const closeBuyModal = useCallback(() => {
    setBuyModalState(null);
  }, []);

  const value: TradingContextValue = {
    // Session
    tradingSession: session.tradingSession,
    currentStep: session.currentStep,
    error: session.error,
    isReady: session.isReady,
    isInitializing: session.isInitializing,
    
    // Clients and state
    clobClient: session.clobClient,
    safeAddress: session.safeAddress,
    credentials: session.credentials,
    allApproved: session.allApproved,
    
    // Actions
    initializeTradingSession: session.initializeTradingSession,
    endTradingSession: session.endTradingSession,
    
    // Trading
    placeOrder: order.placeOrder,
    cancelOrder: order.cancelOrder,
    isPlacing: order.isPlacing,
    orderError: order.orderError,
    
    // Modal
    openBuyModal,
    closeBuyModal,
    buyModalState,
    
    // Wallet connection (unified with Azuro)
    login: session.login,
    isConnected: session.isConnected,
    ready: session.ready,
    
    // Session error feedback
    sessionError: session.error,
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
}
