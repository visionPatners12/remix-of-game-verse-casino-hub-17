import { useEffect } from 'react';
import { useRegisterSW, usePrecacheAssets } from '@/hooks/pwa/useRegisterSW';
import { usePrefetchOptimizations } from '@/hooks/usePrefetch';

/**
 * Composant qui initialise toutes les optimisations PWA
 * - Enregistrement du Service Worker
 * - Précaching des assets
 * - Prefetching intelligent des routes
 */
export function PWAOptimizations() {
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW();
  
  // Précacher les assets critiques
  usePrecacheAssets();
  
  // Activer le prefetching intelligent
  usePrefetchOptimizations();

  // Log des états pour debug (en dev uniquement)
  useEffect(() => {
    if (import.meta.env.DEV) {
      if (offlineReady) {
        console.log('[PWA] App prête pour le mode offline');
      }
      if (needRefresh) {
        console.log('[PWA] Nouvelle version disponible');
      }
    }
  }, [offlineReady, needRefresh]);

  // Ce composant ne rend rien, il gère juste les effets
  return null;
}

export default PWAOptimizations;
