/**
 * Helpers for match_state enum values
 * Maps database enum to UI states
 */

export type MatchState = 
  | "To be announced"
  | "Not started" 
  | "First half"
  | "Half time"
  | "Second half"
  | "Extra time"
  | "Break time"
  | "Penalties"
  | "Suspended"
  | "Interrupted"
  | "Finished"
  | "Finished after penalties"
  | "Finished after extra time"
  | "Postponed"
  | "Cancelled"
  | "Abandoned"
  | "Awarded"
  | "In progress"
  | "Unknown";

/**
 * Check if a match state represents a live game
 */
export function isLiveState(state: string | null | undefined): boolean {
  if (!state) return false;
  
  const liveStates = [
    'First half',
    'Half time',
    'Second half',
    'Extra time',
    'Break time',
    'Penalties',
    'In progress'
  ];
  
  return liveStates.includes(state);
}

/**
 * Check if a match state represents a finished game
 */
export function isFinishedState(state: string | null | undefined): boolean {
  if (!state) return false;
  
  const finishedStates = [
    'Finished',
    'Finished after penalties',
    'Finished after extra time',
    'Awarded'
  ];
  
  return finishedStates.includes(state);
}

/**
 * Get display status text for a match state
 */
export function getDisplayStatus(state: string | null | undefined, sportSlug?: string): string {
  if (!state) return 'À venir';
  
  const stateMapping: Record<string, string> = {
    'To be announced': 'À déterminer',
    'Not started': 'À venir',
    'First half': '1ère mi-temps',
    'Half time': 'Mi-temps',
    'Second half': '2ème mi-temps',
    'Extra time': 'Prolongations',
    'Break time': 'Pause',
    'Penalties': 'Pénaltys',
    'Suspended': 'Suspendu',
    'Interrupted': 'Interrompu',
    'Finished': 'Terminé',
    'Finished after penalties': 'Terminé (TAB)',
    'Finished after extra time': 'Terminé (AP)',
    'Postponed': 'Reporté',
    'Cancelled': 'Annulé',
    'Abandoned': 'Abandonné',
    'Awarded': 'Accordé',
    'In progress': 'En cours',
    'Unknown': 'Inconnu'
  };
  
  return stateMapping[state] || state;
}

/**
 * Get badge variant for a match state
 */
export function getStateBadgeVariant(state: string | null | undefined): 'default' | 'destructive' | 'outline' | 'secondary' {
  if (!state) return 'outline';
  
  if (isLiveState(state)) {
    // Half time and breaks get secondary
    if (state === 'Half time' || state === 'Break time') {
      return 'secondary';
    }
    return 'destructive';
  }
  
  if (isFinishedState(state)) {
    return 'default';
  }
  
  // Cancelled, postponed, etc.
  if (['Cancelled', 'Postponed', 'Abandoned', 'Suspended', 'Interrupted'].includes(state)) {
    return 'outline';
  }
  
  return 'outline';
}
