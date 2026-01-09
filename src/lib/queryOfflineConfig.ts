import { onlineManager } from '@tanstack/react-query';

/**
 * Configure React Query pour être conscient du statut réseau
 * Permet de gérer correctement le mode offline
 */
export function setupOfflineQueryManager() {
  // Ne pas exécuter côté serveur
  if (typeof window === 'undefined') return;

  // Sync avec le statut réseau du navigateur
  onlineManager.setEventListener((setOnline) => {
    const handleOnline = () => {
      console.log('[QueryOffline] Network online');
      setOnline(true);
    };
    
    const handleOffline = () => {
      console.log('[QueryOffline] Network offline');
      setOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // État initial
    setOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
}

// Setup automatique à l'import
setupOfflineQueryManager();
