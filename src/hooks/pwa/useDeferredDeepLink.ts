import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStandaloneMode } from '@/hooks/useStandaloneMode';

const PENDING_DEEPLINK_KEY = 'pending_deeplink';
const DEEPLINK_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface PendingDeeplink {
  path: string;
  timestamp: number;
}

// Pages to ignore when saving deeplinks (system/landing pages)
const IGNORED_PATHS = ['/', '/auth', '/onboarding', '/share-target', '/protocol-handler', '/landing'];

/**
 * Hook for managing deferred deep links for PWA installation.
 * 
 * When a user visits a deep link in Safari (not standalone), the path is saved.
 * When the PWA is launched in standalone mode, the saved path is applied.
 * This provides a seamless experience where users land on the same page after installation.
 */
export function useDeferredDeepLink() {
  const { isStandalone } = useStandaloneMode();
  const navigate = useNavigate();

  /**
   * Save the current deep link for later (called in Safari mode)
   * Only saves if:
   * - Not already in standalone mode
   * - Current path is not a system page
   */
  const savePendingDeeplink = useCallback(() => {
    if (isStandalone) return; // Don't save if already in standalone
    
    const currentPath = window.location.pathname + window.location.search;
    
    // Ignore system pages and landing pages
    const basePath = window.location.pathname;
    if (IGNORED_PATHS.some(ignored => basePath === ignored || basePath.startsWith('/landing'))) {
      return;
    }
    
    const pendingDeeplink: PendingDeeplink = {
      path: currentPath,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PENDING_DEEPLINK_KEY, JSON.stringify(pendingDeeplink));
    
    if (import.meta.env.DEV) {
      console.log('[PWA DeepLink] Saved pending deeplink:', currentPath);
    }
  }, [isStandalone]);

  /**
   * Apply the saved deeplink (called when launched in standalone mode)
   * Returns true if a deeplink was applied, false otherwise
   */
  const applyPendingDeeplink = useCallback((): boolean => {
    if (!isStandalone) return false;
    
    const stored = localStorage.getItem(PENDING_DEEPLINK_KEY);
    if (!stored) return false;
    
    try {
      const { path, timestamp }: PendingDeeplink = JSON.parse(stored);
      
      // Check expiration (24 hours)
      if (Date.now() - timestamp > DEEPLINK_EXPIRY) {
        localStorage.removeItem(PENDING_DEEPLINK_KEY);
        if (import.meta.env.DEV) {
          console.log('[PWA DeepLink] Expired deeplink discarded');
        }
        return false;
      }
      
      // Clear the stored deeplink before navigating
      localStorage.removeItem(PENDING_DEEPLINK_KEY);
      
      // Don't navigate if already on the target path
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath === path) {
        if (import.meta.env.DEV) {
          console.log('[PWA DeepLink] Already on target path:', path);
        }
        return false;
      }
      
      // Navigate to the saved path
      if (import.meta.env.DEV) {
        console.log('[PWA DeepLink] Applying deferred deeplink:', path);
      }
      navigate(path, { replace: true });
      return true;
    } catch (error) {
      localStorage.removeItem(PENDING_DEEPLINK_KEY);
      console.error('[PWA DeepLink] Error parsing stored deeplink:', error);
      return false;
    }
  }, [isStandalone, navigate]);

  /**
   * Clear any pending deeplink without applying it
   */
  const clearPendingDeeplink = useCallback(() => {
    localStorage.removeItem(PENDING_DEEPLINK_KEY);
  }, []);

  /**
   * Check if there's a pending deeplink
   */
  const hasPendingDeeplink = useCallback((): boolean => {
    const stored = localStorage.getItem(PENDING_DEEPLINK_KEY);
    if (!stored) return false;
    
    try {
      const { timestamp }: PendingDeeplink = JSON.parse(stored);
      return Date.now() - timestamp < DEEPLINK_EXPIRY;
    } catch {
      return false;
    }
  }, []);

  return { 
    savePendingDeeplink, 
    applyPendingDeeplink, 
    clearPendingDeeplink,
    hasPendingDeeplink 
  };
}
