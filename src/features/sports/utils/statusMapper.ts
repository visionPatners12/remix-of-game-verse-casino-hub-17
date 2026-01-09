/**
 * Map fixture status to UI states
 */

export type MatchStatus = 'upcoming' | 'inplay' | 'finished' | 'cancelled' | 'postponed' | 'abandoned' | 'unknown';

export interface StatusInfo {
  state: string;
  status: MatchStatus;
  isLive: boolean;
  isFinished: boolean;
  displayText: string;
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary';
}

const statusMapping: Record<string, Omit<StatusInfo, 'state'>> = {
  // Scheduled
  'NS': { status: 'upcoming', isLive: false, isFinished: false, displayText: 'À venir', badgeVariant: 'outline' },
  'TBD': { status: 'upcoming', isLive: false, isFinished: false, displayText: 'À déterminer', badgeVariant: 'outline' },
  
  // InPlay - Football/Soccer
  '1H': { status: 'inplay', isLive: true, isFinished: false, displayText: '1ère mi-temps', badgeVariant: 'destructive' },
  '2H': { status: 'inplay', isLive: true, isFinished: false, displayText: '2ème mi-temps', badgeVariant: 'destructive' },
  'HT': { status: 'inplay', isLive: true, isFinished: false, displayText: 'Mi-temps', badgeVariant: 'secondary' },
  'ET': { status: 'inplay', isLive: true, isFinished: false, displayText: 'Prolongations', badgeVariant: 'destructive' },
  'P': { status: 'inplay', isLive: true, isFinished: false, displayText: 'Pénaltys', badgeVariant: 'destructive' },
  
  // InPlay - Basketball
  'Q1': { status: 'inplay', isLive: true, isFinished: false, displayText: '1er quart', badgeVariant: 'destructive' },
  'Q2': { status: 'inplay', isLive: true, isFinished: false, displayText: '2ème quart', badgeVariant: 'destructive' },
  'Q3': { status: 'inplay', isLive: true, isFinished: false, displayText: '3ème quart', badgeVariant: 'destructive' },
  'Q4': { status: 'inplay', isLive: true, isFinished: false, displayText: '4ème quart', badgeVariant: 'destructive' },
  'OT': { status: 'inplay', isLive: true, isFinished: false, displayText: 'Prolongation', badgeVariant: 'destructive' },
  'BT': { status: 'inplay', isLive: true, isFinished: false, displayText: 'Pause', badgeVariant: 'secondary' },
  
  // InPlay - Ice Hockey
  'P1': { status: 'inplay', isLive: true, isFinished: false, displayText: '1ère période', badgeVariant: 'destructive' },
  'P2': { status: 'inplay', isLive: true, isFinished: false, displayText: '2ème période', badgeVariant: 'destructive' },
  'P3': { status: 'inplay', isLive: true, isFinished: false, displayText: '3ème période', badgeVariant: 'destructive' },
  
  // Generic live
  'LIVE': { status: 'inplay', isLive: true, isFinished: false, displayText: 'En direct', badgeVariant: 'destructive' },
  'IP': { status: 'inplay', isLive: true, isFinished: false, displayText: 'En cours', badgeVariant: 'destructive' },
  
  // Finished
  'FT': { status: 'finished', isLive: false, isFinished: true, displayText: 'Terminé', badgeVariant: 'default' },
  'AET': { status: 'finished', isLive: false, isFinished: true, displayText: 'Terminé (AP)', badgeVariant: 'default' },
  'AOT': { status: 'finished', isLive: false, isFinished: true, displayText: 'Terminé (AP)', badgeVariant: 'default' },
  'PEN': { status: 'finished', isLive: false, isFinished: true, displayText: 'Terminé (TAB)', badgeVariant: 'default' },
  
  // Cancelled/Postponed/Abandoned
  'CANC': { status: 'cancelled', isLive: false, isFinished: false, displayText: 'Annulé', badgeVariant: 'outline' },
  'POST': { status: 'postponed', isLive: false, isFinished: false, displayText: 'Reporté', badgeVariant: 'outline' },
  'PST': { status: 'postponed', isLive: false, isFinished: false, displayText: 'Reporté', badgeVariant: 'outline' },
  'ABD': { status: 'abandoned', isLive: false, isFinished: false, displayText: 'Abandonné', badgeVariant: 'outline' },
  'SUSP': { status: 'abandoned', isLive: false, isFinished: false, displayText: 'Suspendu', badgeVariant: 'outline' },
  'INT': { status: 'abandoned', isLive: false, isFinished: false, displayText: 'Interrompu', badgeVariant: 'outline' },
};

/**
 * Get status information from status_short code
 */
export function getStatusInfo(statusShort: string | null | undefined): StatusInfo {
  const short = (statusShort || 'NS').toUpperCase();
  const mapped = statusMapping[short];
  
  if (mapped) {
    return {
      state: short,
      ...mapped,
    };
  }
  
  // Unknown status - treat as upcoming
  return {
    state: short,
    status: 'unknown',
    isLive: false,
    isFinished: false,
    displayText: short,
    badgeVariant: 'outline',
  };
}

/**
 * Check if status is a break/pause
 */
export function isBreakStatus(statusShort: string | null | undefined): boolean {
  const short = (statusShort || '').toUpperCase();
  return ['HT', 'BT'].includes(short);
}

/**
 * Get CSS classes for status badge
 */
export function getStatusBadgeClasses(status: MatchStatus): string {
  const baseClasses = 'text-xs px-2 py-1 font-semibold';
  
  switch (status) {
    case 'inplay':
      return `${baseClasses} animate-pulse`;
    case 'finished':
      return `${baseClasses} opacity-90`;
    case 'cancelled':
    case 'postponed':
    case 'abandoned':
      return `${baseClasses} line-through`;
    default:
      return baseClasses;
  }
}
