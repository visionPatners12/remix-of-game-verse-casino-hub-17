import { useCallback, useState } from 'react';

interface PWAUpdateResult {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  close: () => void;
}

// Check if we're in production mode where PWA is enabled
const isPWAEnabled = import.meta.env.PROD;

export function usePWAUpdate(): PWAUpdateResult {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const close = useCallback(() => {
    setOfflineReady(false);
    setNeedRefresh(false);
  }, []);

  const handleUpdate = useCallback(async () => {
    // In production, this will be handled by the actual PWA registration
    // In development, this is a no-op
    if (isPWAEnabled && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }, []);

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: handleUpdate,
    close,
  };
}
