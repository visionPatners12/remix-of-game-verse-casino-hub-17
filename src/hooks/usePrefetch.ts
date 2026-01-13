import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Configuration des routes à précharger basé sur la route actuelle
 */
const PREFETCH_MAP: Record<string, string[]> = {
  '/dashboard': ['/wallet', '/games', '/feed'],
  '/games': ['/games/ludo', '/dashboard'],
  '/games/ludo': ['/games/ludo/play', '/games'],
  '/wallet': ['/dashboard', '/wallet/send', '/wallet/receive'],
  '/feed': ['/dashboard', '/explore'],
  '/explore': ['/feed', '/dashboard'],
};

/**
 * Routes critiques à toujours précharger
 */
const CRITICAL_ROUTES = ['/dashboard', '/wallet', '/games'];

/**
 * Hook pour précharger les routes probables
 * Utilise le preload des chunks Vite pour les routes lazy-loaded
 */
export function usePrefetchRoutes() {
  const location = useLocation();

  useEffect(() => {
    const routesToPrefetch = PREFETCH_MAP[location.pathname] || [];
    
    // Précharger après le rendu initial
    const timeoutId = setTimeout(() => {
      routesToPrefetch.forEach((route) => {
        // Créer un lien de prefetch pour les chunks
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        
        // Éviter les doublons
        if (!document.querySelector(`link[href="${route}"][rel="prefetch"]`)) {
          document.head.appendChild(link);
        }
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
}

/**
 * Hook pour précharger les données critiques
 */
export function usePrefetchData() {
  const queryClient = useQueryClient();
  const location = useLocation();

  const prefetchWalletData = useCallback(() => {
    // Précharger le solde si pas déjà en cache
    const balanceKey = ['wallet-balance'];
    if (!queryClient.getQueryData(balanceKey)) {
      queryClient.prefetchQuery({
        queryKey: balanceKey,
        staleTime: 1000 * 30,
      });
    }
  }, [queryClient]);

  const prefetchFeedData = useCallback(() => {
    const feedKey = ['timeline-feed'];
    if (!queryClient.getQueryData(feedKey)) {
      queryClient.prefetchQuery({
        queryKey: feedKey,
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [queryClient]);

  useEffect(() => {
    // Précharger basé sur la route actuelle
    switch (location.pathname) {
      case '/dashboard':
        prefetchWalletData();
        prefetchFeedData();
        break;
      case '/wallet':
        prefetchFeedData();
        break;
      case '/feed':
        prefetchWalletData();
        break;
    }
  }, [location.pathname, prefetchWalletData, prefetchFeedData]);
}

/**
 * Hook pour précharger les chunks JavaScript des routes
 * Utilise l'intersection observer pour précharger au hover/focus
 */
export function useLinkPrefetch(routes: string[]) {
  const prefetch = useCallback((route: string) => {
    // Utiliser modulepreload pour les chunks ES modules
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    
    // Mapper la route vers le chunk correspondant
    // Vite génère des chunks avec des noms prévisibles
    const chunkMap: Record<string, string> = {
      '/dashboard': '/src/pages/Dashboard.tsx',
      '/wallet': '/src/pages/Wallet.tsx',
      '/games': '/src/pages/Games.tsx',
      '/feed': '/src/pages/Feed.tsx',
    };
    
    const chunk = chunkMap[route];
    if (chunk && !document.querySelector(`link[href*="${chunk}"]`)) {
      // Le dynamic import de Vite gérera le préchargement
      import(/* @vite-ignore */ chunk).catch(() => {
        // Ignorer les erreurs de préchargement
      });
    }
  }, []);

  return { prefetch };
}

/**
 * Hook combiné pour toutes les optimisations de préchargement
 */
export function usePrefetchOptimizations() {
  usePrefetchRoutes();
  usePrefetchData();
}
