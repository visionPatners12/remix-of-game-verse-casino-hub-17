// Hook to manage the trading session for Polymarket
// Uses unified wallet from Privy and real Polymarket integration

import { useState, useCallback, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { BrowserProvider } from 'ethers';
import { useUnifiedWallet } from '@/features/wallet';

import type { TradingSession, TradingStep } from '../types/trading';
import { useClobClient, type ApiKeyCreds } from './useClobClient';
import { useUserApiCredentials } from './useUserApiCredentials';
import { useSafeDeployment } from './useSafeDeployment';
import { useTokenApprovals } from './useTokenApprovals';
import { saveSession, loadSession, clearSession } from '../utils/session';
import { wrapSignerForV5Compat } from '../utils/ethersAdapter';
import { createSignerFromSmartWallet } from '../utils/smartWalletAdapter';
import { logger } from '@/utils/logger';

export function useTradingSession() {
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const { client: smartWalletClient } = useSmartWallets();
  const { address, isConnected, walletClient, connectWallet, isAAWallet } = useUnifiedWallet();

  const [tradingSession, setTradingSession] = useState<TradingSession | null>(null);
  const [currentStep, setCurrentStep] = useState<TradingStep>('idle');
  const [error, setError] = useState<string | null>(null);

  // Sub-hooks
  const { clobClient, initializeClobClient, resetClobClient } = useClobClient();
  const { credentials, deriveCredentials, loadFromStorage, clearCredentials } = useUserApiCredentials();
  const { safeAddress, deriveSafe, reset: resetSafe } = useSafeDeployment();
  const { checkApprovals, setApprovals, allApproved, reset: resetApprovals } = useTokenApprovals();

  // Initialize trading session with full Polymarket integration
  const initializeTradingSession = useCallback(async () => {
    if (!ready || !isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setCurrentStep('connecting');

      logger.info('[TradingSession] Starting initialization for:', address);
      logger.info('[TradingSession] Is AA Wallet:', isAAWallet);

      let signer: any;

      if (isAAWallet && smartWalletClient) {
        // For email/social users with Smart Wallet (AA)
        logger.info('[TradingSession] Using Smart Wallet client for AA user');
        signer = createSignerFromSmartWallet(smartWalletClient);
      } else {
        // For external wallet users (MetaMask, etc.)
        logger.info('[TradingSession] Using external wallet');
        
        const privyWallet = wallets.find(w => 
          w.address.toLowerCase() === address.toLowerCase()
        );
        
        if (!privyWallet) {
          throw new Error('Wallet not found. Please reconnect your wallet.');
        }

        const ethereumProvider = await privyWallet.getEthereumProvider();
        const provider = new BrowserProvider(ethereumProvider);
        const rawSigner = await provider.getSigner();
        signer = wrapSignerForV5Compat(rawSigner);
      }
      
      logger.info('[TradingSession] Signer ready');

      // 2. Derive Safe address (currently uses EOA directly)
      setCurrentStep('deriving-safe');
      const safe = await deriveSafe(address);
      logger.info('[TradingSession] Safe/trading address:', safe);

      // 3. Get API credentials (from storage or derive via L1 signature)
      setCurrentStep('getting-credentials');
      let creds: ApiKeyCreds | null = loadFromStorage(address);
      
      if (!creds) {
        logger.info('[TradingSession] No stored credentials, deriving...');
        creds = await deriveCredentials(signer);
      }
      
      if (!creds) {
        throw new Error('Failed to obtain API credentials');
      }
      logger.info('[TradingSession] Got API credentials');

      // 4. Check token approvals
      setCurrentStep('setting-approvals');
      const approvalStatus = await checkApprovals(safe);
      
      if (!approvalStatus.allApproved && walletClient) {
        logger.info('[TradingSession] Setting missing approvals...');
        await setApprovals(walletClient, safe);
      }

      // 5. Initialize ClobClient with BuilderConfig
      // Pass isAAWallet to use correct SignatureType (2 for Smart Wallet)
      const client = await initializeClobClient(signer, creds, safe, isAAWallet);
      
      if (!client) {
        throw new Error('Failed to initialize trading client');
      }
      logger.info('[TradingSession] ClobClient ready');

      // 6. Create and save session
      const session: TradingSession = {
        address: safe,
        timestamp: Date.now(),
        eoaAddress: address,
        safeAddress: safe,
      };

      saveSession(address, session);
      setTradingSession(session);
      setCurrentStep('ready');

      logger.info('[TradingSession] Session initialized successfully');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[TradingSession] Error:', message);
      setError(message);
      setCurrentStep('error');
    }
  }, [
    ready, isConnected, address, wallets, walletClient,
    isAAWallet, smartWalletClient,
    deriveSafe, loadFromStorage, deriveCredentials,
    checkApprovals, setApprovals, initializeClobClient
  ]);

  // End the trading session
  const endTradingSession = useCallback(() => {
    clearSession();
    setTradingSession(null);
    setCurrentStep('idle');
    setError(null);
    resetClobClient();
    clearCredentials(address ?? undefined);
    resetSafe();
    resetApprovals();
    logger.info('[TradingSession] Session ended');
  }, [address, resetClobClient, clearCredentials, resetSafe, resetApprovals]);

  // Check for existing session on mount and auto-initialize if connected
  useEffect(() => {
    const checkExistingSession = async () => {
      if (!ready || !isConnected || !address) return;
      if (currentStep !== 'idle') return; // Don't re-init if already in progress

      const savedSession = loadSession(address);

      if (savedSession) {
        logger.info('[TradingSession] Found saved session, re-initializing...');
        setTradingSession(savedSession);
        // Re-initialize to get fresh ClobClient
        await initializeTradingSession();
      } else if (isConnected && address) {
        // Auto-initialize session when connected
        await initializeTradingSession();
      }
    };

    checkExistingSession();
  }, [ready, isConnected, address]); // Don't include initializeTradingSession to avoid loops

  return {
    // Session state
    tradingSession,
    currentStep,
    error,
    isReady: currentStep === 'ready',
    isInitializing: !['idle', 'ready', 'error'].includes(currentStep),

    // Clients
    clobClient,
    safeAddress,
    credentials,

    // Approval status
    allApproved,

    // Actions
    initializeTradingSession,
    endTradingSession,

    // Wallet connection (unified with Azuro)
    login: connectWallet,
    isConnected,
    ready,
    walletClient,
    address,
  };
}
