import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Persister pour sauvegarder le cache React Query dans localStorage
 * Permet d'afficher les données en cache immédiatement au lancement de l'app
 */
export const queryPersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'pryzen-query-cache',
  throttleTime: 1000, // Limiter les écritures à 1 par seconde pour éviter trop d'IO
});
