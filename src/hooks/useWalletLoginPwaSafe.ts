import { useEffect, useMemo, useState, useCallback } from "react";
import { useWallets, usePrivy, useLogin } from "@privy-io/react-auth";
import { markWcPending, clearWcPending, getWcPending, isPWA } from "@/utils/walletConnectPwa";
import { logger } from "@/utils/logger";

export type WalletConnectPhase = 
  | "idle" 
  | "launching" 
  | "waiting_return" 
  | "restoring" 
  | "connected"
  | "failed";

export function useWalletLoginPwaSafe() {
  const { wallets, ready: walletsReady } = useWallets();
  const { ready: privyReady, authenticated } = usePrivy();
  const [phase, setPhase] = useState<WalletConnectPhase>("idle");

  // Detect external wallet (non-embedded Privy wallet)
  const externalWallet = useMemo(
    () => wallets?.find(w => w.walletClientType !== "privy") ?? null,
    [wallets]
  );

  // Combined ready state - both Privy and wallets must be ready
  const isFullyReady = privyReady && walletsReady;

  // Start wallet connection with Privy
  const { login } = useLogin({
    onComplete: () => {
      logger.debug("PWA: Login completed successfully");
      clearWcPending();
      setPhase("connected");
    },
    onError: (err) => {
      const errorMessage = typeof err === 'string' ? err : (err as Error)?.message || '';
      
      // Ignore if user just closed the modal - not an error
      if (errorMessage.includes('exited_auth_flow') || errorMessage.includes('user_exited')) {
        logger.debug("PWA: User exited auth flow - not an error");
        setPhase("idle");
        clearWcPending();
        return;
      }
      
      logger.error("PWA: Login error", err);
      // Only set failed if we were actually trying to connect
      if (phase !== "idle") {
        setPhase("failed");
      }
    },
  });

  const startWalletConnect = useCallback(() => {
    // Mark pending state before launching wallet (for PWA restart recovery)
    if (isPWA()) {
      markWcPending();
      logger.debug("PWA: Marked connection as pending");
    }
    
    setPhase("launching");
    
    login({
      loginMethods: ['email', 'wallet', 'sms'],
      walletChainType: 'ethereum-only',
    });

    // After a short delay, transition to "waiting_return" phase
    // This gives the wallet app time to open
    setTimeout(() => {
      setPhase(currentPhase => (currentPhase === "launching" ? "waiting_return" : currentPhase));
    }, 800);
  }, [login]);

  // Resume logic - called when PWA returns from wallet app
  const resume = useCallback(() => {
    const pending = getWcPending();
    if (!pending) return;

    logger.debug("PWA: Checking wallet connection after return", { 
      walletsReady, 
      privyReady,
      authenticated,
      hasExternalWallet: !!externalWallet,
      phase
    });

    // Still loading - show restoring state
    if (!isFullyReady) {
      setPhase("restoring");
      return;
    }

    // Wallet found or authenticated after return - success!
    if (externalWallet || authenticated) {
      clearWcPending();
      setPhase("connected");
      logger.debug("PWA: Connection restored successfully");
      return;
    }

    // Privy is ready but no wallet detected - connection failed
    setPhase("failed");
    logger.debug("PWA: Connection failed - no wallet found after return");
  }, [isFullyReady, externalWallet, authenticated, walletsReady, privyReady, phase]);

  // Set up event listeners for PWA return detection
  useEffect(() => {
    // Clean up any expired pending states on mount (silently)
    getWcPending();
    
    const onVisibilityChange = () => {
      // Only resume if we have a pending connection AND visibility changed to visible
      if (document.visibilityState === "visible" && getWcPending()) {
        logger.debug("PWA: Visibility changed to visible with pending connection");
        resume();
      }
    };

    const onPageShow = (e: PageTransitionEvent) => {
      // Only resume if restored from bfcache AND we have a pending connection
      if (e.persisted && getWcPending()) {
        logger.debug("PWA: Page restored from bfcache with pending connection");
        resume();
      }
    };

    // Focus event - important for iOS PWA return detection
    const onFocus = () => {
      if (getWcPending()) {
        logger.debug("PWA: Window focused with pending connection");
        resume();
      }
    };

    // iOS uses pageshow event when restoring PWA
    window.addEventListener("pageshow", onPageShow);
    // Standard visibility change for tab switching
    document.addEventListener("visibilitychange", onVisibilityChange);
    // Focus event for better iOS PWA detection
    window.addEventListener("focus", onFocus);

    // DO NOT call resume() on initial mount - only on actual return events
    // This prevents false "failed" states when first loading the page

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [resume]);

  // Auto-transition to connected when wallet appears during active flow
  useEffect(() => {
    if (isFullyReady && (externalWallet || authenticated) && phase !== "idle" && phase !== "connected") {
      clearWcPending();
      setPhase("connected");
      logger.debug("PWA: Auto-detected connection completion");
    }
  }, [isFullyReady, externalWallet, authenticated, phase]);

  // Reset to idle if user cancels or times out
  const cancel = useCallback(() => {
    clearWcPending();
    setPhase("idle");
  }, []);

  return {
    phase,
    isFullyReady,
    externalWallet,
    authenticated,
    startWalletConnect,
    retry: startWalletConnect,
    cancel,
    isPWA: isPWA(),
  };
}
