/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare global {
  // Extension du namespace AzuroSDK pour le betslip
  namespace AzuroSDK {
    interface BetslipItem {
      // === Champs de base Azuro (déjà requis par Selection) ===
      // conditionId et outcomeId sont hérités de Selection
      gameId: string;
      isExpressForbidden: boolean;
      
      // === Champs blockchain (optionnels) ===
      coreAddress?: string;
      lpAddress?: string;
      
      // === Champs d'affichage personnalisés ===
      eventName?: string;      // "Team A vs Team B"
      marketType?: string;     // Type de marché
      pick?: string;           // Choix de l'utilisateur
      
      // === Champs Azuro natifs ===
      marketName?: string;     // Nom du marché depuis l'API
      selectionName?: string;  // Nom de la sélection depuis l'API
      odds?: number;           // Cote
      isLive?: boolean;        // Match en live
      
      // === Localisation ===
      sportSlug?: string;
      leagueName?: string;
      leagueSlug?: string;
      countryName?: string;
      countrySlug?: string;
      
      // === Sport & League (format objet) ===
      sport?: {
        name: string;
        slug: string;
      };
      league?: {
        name: string;
        slug: string;
        logo?: string;
      };
      
      // === Participants ===
      participants?: Array<{ 
        name: string; 
        image?: string | null;
      }>;
      participantImages?: string[];
      
      // === Metadata ===
      startsAt?: string | number;
      state?: string;
      
      // === Custom fields for non-Azuro markets (e.g., Polymarket) ===
      polymarketId?: string;
      marketId?: string;
      side?: string;
    }
  }
}

export {};
