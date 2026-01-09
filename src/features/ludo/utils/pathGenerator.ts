import { TRACK, TRACK_LEN, START_INDEX, ENTRY_INDEX, SAFE_BASE, SAFE_LEN, HOME_BASE, GOAL } from '../model/ludoModel';
import type { Color } from '../model/ludoModel';

/**
 * Génère le chemin case par case entre deux positions
 * @returns Array of positions representing each step of the path
 */
export function generatePath(
  startPosition: number,
  endPosition: number,
  color: Color
): number[] {
  const path: number[] = [];
  
  // Cas 1: Sortie de HOME vers START - saut direct
  const homeBase = HOME_BASE[color];
  if (startPosition >= homeBase && startPosition <= homeBase + 3) {
    return [START_INDEX[color]];
  }
  
  // Cas 2: Sortie de PRISON vers HOME - saut direct
  if (startPosition < -50) { // Prison positions are < -50
    return [endPosition];
  }
  
  // Cas 3: Déjà dans le couloir de sécurité
  const safeBase = SAFE_BASE[color];
  if (startPosition >= safeBase && startPosition < safeBase + SAFE_LEN) {
    // Mouvement dans le couloir de sécurité
    const startSafeIndex = startPosition - safeBase;
    
    if (endPosition === GOAL) {
      // Avancer jusqu'au GOAL
      for (let i = startSafeIndex + 1; i < SAFE_LEN; i++) {
        path.push(safeBase + i);
      }
      path.push(GOAL);
    } else if (endPosition >= safeBase) {
      // Avancer dans le couloir
      const endSafeIndex = endPosition - safeBase;
      for (let i = startSafeIndex + 1; i <= endSafeIndex; i++) {
        path.push(safeBase + i);
      }
    }
    return path;
  }
  
  // Cas 4: Sur le track principal (0-55)
  if (startPosition >= 0 && startPosition < TRACK_LEN) {
    const entryIndex = ENTRY_INDEX[color];
    let current = startPosition;
    
    // Calculer si on doit entrer dans le couloir de sécurité
    const distToEntry = (entryIndex - startPosition + TRACK_LEN) % TRACK_LEN;
    
    // Si la destination est dans le couloir de sécurité ou GOAL
    if (endPosition >= safeBase || endPosition === GOAL) {
      // D'abord, avancer jusqu'à l'entrée du couloir
      while (current !== entryIndex) {
        current = (current + 1) % TRACK_LEN;
        path.push(current);
      }
      
      // Puis entrer dans le couloir de sécurité
      if (endPosition === GOAL) {
        for (let i = 0; i < SAFE_LEN; i++) {
          path.push(safeBase + i);
        }
        path.push(GOAL);
      } else {
        const endSafeIndex = endPosition - safeBase;
        for (let i = 0; i <= endSafeIndex; i++) {
          path.push(safeBase + i);
        }
      }
    } else {
      // Mouvement simple sur le track
      while (current !== endPosition) {
        current = (current + 1) % TRACK_LEN;
        path.push(current);
      }
    }
    
    return path;
  }
  
  // Fallback - saut direct si cas non géré
  return [endPosition];
}

/**
 * Calcule la durée totale de l'animation en ms
 */
export function calculateAnimationDuration(pathLength: number, stepDuration: number = 120): number {
  return pathLength * stepDuration;
}
