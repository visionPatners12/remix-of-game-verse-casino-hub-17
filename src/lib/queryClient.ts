import { QueryClient } from '@tanstack/react-query';

// Configuration optimisée du QueryClient pour réduire les requêtes API
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 10, // 10 minutes par défaut (était 5)
      gcTime: 1000 * 60 * 60 * 24, // 24 heures - important pour la persistance
      refetchOnWindowFocus: false, // Désactivé par défaut pour économiser data
      refetchOnReconnect: false, // Désactivé - on garde le cache
      refetchOnMount: false, // Désactivé - utiliser le cache existant
    },
    mutations: {
      retry: 1,
    },
  },
});

// Configuration des caches pour différents types de données
export const cacheConfigs = {
  // Données utilisateur - cache court
  user: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
  
  // Données de paris - cache court
  bets: {
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
  },
  
  // Feed social - cache optimisé (5 min pour réduire refetch inutiles)
  feed: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Timeline feed - cache similaire au feed
  timeline: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Balance USDT - cache optimisé
  balance: {
    staleTime: 1000 * 30, // 30 secondes - données financières critiques
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refresh automatique toutes les minutes
  },
  
  // Données de jeux - cache moyen (augmenté)
  games: {
    staleTime: 1000 * 60 * 30, // 30 minutes (était 10)
    gcTime: 1000 * 60 * 60, // 1 heure (était 30 min)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Données de match - cache court pour fraîcheur
  match: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: 'always' as const,
  },
  
  // Données mises en avant - cache court
  featured: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },
  
  // Données du store - cache long (augmenté)
  store: {
    staleTime: 1000 * 60 * 60, // 1 heure (était 30 min)
    gcTime: 1000 * 60 * 60 * 2, // 2 heures (était 1h)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Données statiques - cache très long (augmenté)
  static: {
    staleTime: 1000 * 60 * 60 * 24, // 24 heures (était 1h)
    gcTime: 1000 * 60 * 60 * 48, // 48 heures (était 2h)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  
  // Données temps réel (exceptions qui ont besoin de fraîcheur)
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: 'always' as const,
  },
  
  // Données semi-statiques (ligues, équipes, sports)
  semiStatic: {
    staleTime: 1000 * 60 * 60, // 1 heure
    gcTime: 1000 * 60 * 60 * 4, // 4 heures
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
};
