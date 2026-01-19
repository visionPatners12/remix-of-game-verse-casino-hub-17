import { useEffect, useRef } from 'react';
import { useStandaloneMode } from '@/hooks/useStandaloneMode';
import { useDeferredDeepLink } from '@/hooks/pwa/useDeferredDeepLink';
import { useLocation } from 'react-router-dom';

/**
 * Component that handles deferred deep links for PWA.
 * 
 * Behavior:
 * - In Safari (not standalone) on iOS: saves the current deep link to localStorage
 * - In Standalone mode (after PWA install): applies the saved deep link on first launch
 * 
 * This enables the "deferred deep link" pattern:
 * 1. User clicks a link like pryzen.app/games/ludo/play/123
 * 2. Opens in Safari, path is saved
 * 3. User installs PWA via "Add to Home Screen"
 * 4. On first PWA launch, user is redirected to /games/ludo/play/123
 */
export function DeferredDeeplinkHandler() {
  const { isStandalone, isIOS } = useStandaloneMode();
  const { savePendingDeeplink, applyPendingDeeplink } = useDeferredDeepLink();
  const location = useLocation();
  const hasAppliedRef = useRef(false);

  // In standalone mode: apply the pending deeplink once on mount
  useEffect(() => {
    if (isStandalone && !hasAppliedRef.current) {
      hasAppliedRef.current = true;
      const applied = applyPendingDeeplink();
      if (applied && import.meta.env.DEV) {
        console.log('[PWA] Applied deferred deeplink after install');
      }
    }
  }, [isStandalone, applyPendingDeeplink]);

  // In Safari on iOS: save the current path when visiting deep pages
  // Re-run when location changes to capture new deep links
  useEffect(() => {
    if (!isStandalone && isIOS) {
      savePendingDeeplink();
    }
  }, [isStandalone, isIOS, savePendingDeeplink, location.pathname, location.search]);

  // This component doesn't render anything
  return null;
}

export default DeferredDeeplinkHandler;
