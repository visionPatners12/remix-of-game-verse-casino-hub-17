import { useCallback, useEffect, useState } from 'react';

interface RegisterSWResult {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  close: () => void;
  registration: ServiceWorkerRegistration | null;
}

const isPWAEnabled = import.meta.env.PROD;

/**
 * Hook pour gérer l'enregistrement du Service Worker
 * avec support des mises à jour et du mode offline
 */
export function useRegisterSW(): RegisterSWResult {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isPWAEnabled || !('serviceWorker' in navigator)) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        
        setRegistration(reg);

        // Vérifier si le SW est prêt pour le mode offline
        if (reg.active) {
          setOfflineReady(true);
        }

        // Écouter les mises à jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                setNeedRefresh(true);
                console.log('[SW] Nouvelle version disponible');
              }
            });
          }
        });

        // Vérifier les mises à jour périodiquement (toutes les heures)
        intervalId = setInterval(() => {
          reg.update().catch(console.error);
        }, 60 * 60 * 1000);

        // Gérer les messages du SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'CACHE_UPDATED') {
            console.log('[SW] Cache mis à jour');
          }
        });

        // Écouter le controllerchange pour recharger
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('[SW] Erreur d\'enregistrement:', error);
      }
    };

    registerSW();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const close = useCallback(() => {
    setOfflineReady(false);
    setNeedRefresh(false);
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!registration?.waiting) {
      // Pas de SW en attente, vérifier les mises à jour
      await registration?.update();
      return;
    }

    // Envoyer le message pour activer le nouveau SW
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [registration]);

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    close,
    registration,
  };
}

/**
 * Hook pour précharger les assets critiques
 */
export function usePrecacheAssets() {
  useEffect(() => {
    if (!isPWAEnabled || !('serviceWorker' in navigator)) {
      return;
    }

    const precache = async () => {
      const reg = await navigator.serviceWorker.ready;
      
      // Envoyer la liste des assets à précacher
      reg.active?.postMessage({
        type: 'PRECACHE',
        urls: [
          '/dashboard',
          '/games',
          '/wallet',
        ],
      });
    };

    // Précacher après un court délai pour ne pas bloquer le rendu initial
    const timeoutId = setTimeout(precache, 3000);

    return () => clearTimeout(timeoutId);
  }, []);
}
