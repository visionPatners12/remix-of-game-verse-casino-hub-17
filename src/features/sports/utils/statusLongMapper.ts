/**
 * Mapper pour status_long (valeurs textuelles complètes)
 */

import type { MatchWithStatusLong } from '@/features/sports/types/supabase';

export type MatchStatus = 'upcoming' | 'inplay' | 'finished' | 'cancelled' | 'postponed' | 'abandoned';

export interface StatusLongInfo {
  status: MatchStatus;
  isLive: boolean;
  isFinished: boolean;
  displayText: string;
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary';
}

const statusLongMapping: Record<string, StatusLongInfo> = {
  // À venir
  'Not started': { 
    status: 'upcoming', isLive: false, isFinished: false, 
    displayText: 'À venir', badgeVariant: 'outline' 
  },
  'Scheduled': { 
    status: 'upcoming', isLive: false, isFinished: false, 
    displayText: 'Programmé', badgeVariant: 'outline' 
  },
  
  // En cours - Basketball
  'First quarter': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: '1er quart', badgeVariant: 'destructive' 
  },
  'Second quarter': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: '2ème quart', badgeVariant: 'destructive' 
  },
  'Third quarter': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: '3ème quart', badgeVariant: 'destructive' 
  },
  'Fourth quarter': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: '4ème quart', badgeVariant: 'destructive' 
  },
  'Half time': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: 'Mi-temps', badgeVariant: 'secondary' 
  },
  'Overtime': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: 'Prolongation', badgeVariant: 'destructive' 
  },
  
  // En cours - Football
  'First half': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: '1ère mi-temps', badgeVariant: 'destructive' 
  },
  'Second half': { 
    status: 'inplay', isLive: true, isFinished: false, 
    displayText: '2ème mi-temps', badgeVariant: 'destructive' 
  },
  
  // Terminés
  'Finished': { 
    status: 'finished', isLive: false, isFinished: true, 
    displayText: 'Terminé', badgeVariant: 'default' 
  },
  'Finished after over time': { 
    status: 'finished', isLive: false, isFinished: true, 
    displayText: 'Terminé (AP)', badgeVariant: 'default' 
  },
  'Finished after extra time': { 
    status: 'finished', isLive: false, isFinished: true, 
    displayText: 'Terminé (AP)', badgeVariant: 'default' 
  },
  
  // Annulés/Reportés
  'Cancelled': { 
    status: 'cancelled', isLive: false, isFinished: false, 
    displayText: 'Annulé', badgeVariant: 'outline' 
  },
  'Postponed': { 
    status: 'postponed', isLive: false, isFinished: false, 
    displayText: 'Reporté', badgeVariant: 'outline' 
  },
  'Abandoned': { 
    status: 'abandoned', isLive: false, isFinished: false, 
    displayText: 'Abandonné', badgeVariant: 'outline' 
  },
};

export function getStatusLongInfo(statusLong: string | null | undefined): StatusLongInfo {
  const status = statusLong?.trim();
  
  if (!status || !statusLongMapping[status]) {
    return {
      status: 'upcoming',
      isLive: false,
      isFinished: false,
      displayText: 'À venir',
      badgeVariant: 'outline',
    };
  }
  
  return statusLongMapping[status];
}

/**
 * Filtre les matchs par catégorie basé uniquement sur status_long
 */
export function filterMatchesByStatus<T extends MatchWithStatusLong>(
  matches: T[], 
  filter: 'upcoming' | 'past' | 'live'
): T[] {
  return matches.filter(match => {
    const status = match.status_long?.toLowerCase() || '';
    
    switch (filter) {
      case 'upcoming':
        return status === 'not started' || status === 'scheduled';
      
      case 'past':
        return status.includes('finished') || status.includes('cancelled') || 
               status.includes('postponed') || status.includes('abandoned');
      
      case 'live':
        return status.includes('quarter') || status.includes('half') || 
               status.includes('overtime') || status === 'in progress';
      
      default:
        return true;
    }
  });
}
