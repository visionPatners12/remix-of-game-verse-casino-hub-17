import { TRACK, PRISON_BASE, PRISON_SLOTS_COUNT, isInPrison } from '../model/ludoModel';
import { HOME_PAWNS, PRISON_SLOTS } from '../model/constants';
import { center } from '../model/utils';
import type { Color } from '../model/ludoModel';

export interface PawnPosition {
  x: number;
  y: number;
}

// Mapping des couleurs vers les positions HOME_PAWNS
const HOME_PAWN_INDICES = {
  R: [0, 1, 2, 3], // Red pawns indices dans HOME_PAWNS
  G: [4, 5, 6, 7], // Green pawns indices
  Y: [8, 9, 10, 11], // Yellow pawns indices
  B: [12, 13, 14, 15], // Blue pawns indices
} as const;

// Safe corridor base positions pour chaque couleur
const SAFE_CORRIDOR_LABELS = {
  R: ['H2', 'H3', 'H4', 'H5', 'H6', 'H7'], // Red safe corridor + goal
  G: ['B8', 'C8', 'D8', 'E8', 'F8', 'G8'], // Green safe corridor + goal
  Y: ['H14', 'H13', 'H12', 'H11', 'H10', 'H9'], // Yellow safe corridor + goal
  B: ['N8', 'M8', 'L8', 'K8', 'J8', 'I8'], // Blue safe corridor + goal
} as const;

/**
 * Convertit une position numérique en coordonnées sur le plateau
 */
export function positionToCoordinates(
  position: number,
  color: Color,
  pawnIndex: number,
  cellSize: number,
  padding: number,
  showHeaders: boolean = true
): PawnPosition {
  
  // Position 0-55 = sur le track principal
  if (position >= 0 && position < TRACK.length) {
    const trackLabel = TRACK[position];
    return center(trackLabel, cellSize, padding, showHeaders);
  }
  
  // Position 100+ = safe corridor
  if (position >= 100) {
    const safeIndex = position - (color === 'R' ? 100 : color === 'G' ? 200 : color === 'Y' ? 300 : 400);
    if (safeIndex < SAFE_CORRIDOR_LABELS[color].length) {
      const safeLabel = SAFE_CORRIDOR_LABELS[color][safeIndex];
      return center(safeLabel, cellSize, padding, showHeaders);
    }
  }
  
  // Position 999 = GOAL (centre du plateau)
  if (position === 999) {
    return center('H8', cellSize, padding, showHeaders); // Centre du plateau
  }
  
  // Position -100 à -119 = Prison RED
  // Position -200 à -219 = Prison GREEN  
  // Position -300 à -319 = Prison YELLOW
  // Position -400 à -419 = Prison BLUE
  const prisonColors = ['R', 'G', 'Y', 'B'] as Color[];
  for (const prisonColor of prisonColors) {
    if (isInPrison(position, prisonColor)) {
      const base = PRISON_BASE[prisonColor];
      const slotIndex = base - position; // Ordre d'arrivée (0 à 19)
      const colorName = prisonColor === 'R' ? 'RED' : prisonColor === 'G' ? 'GREEN' : prisonColor === 'Y' ? 'YELLOW' : 'BLUE';
      const prisonSlots = PRISON_SLOTS[colorName];
      
      if (slotIndex < prisonSlots.length) {
        const slotLabel = prisonSlots[slotIndex];
        return center(slotLabel, cellSize, padding, showHeaders);
      }
    }
  }
  
  // Position -10 à -7 = HOME RED
  // Position -20 à -17 = HOME GREEN  
  // Position -30 à -27 = HOME YELLOW
  // Position -40 à -37 = HOME BLUE
  const HOME_BASE_VALUES = { R: -10, G: -20, Y: -30, B: -40 };
  if (position >= HOME_BASE_VALUES[color] && position <= HOME_BASE_VALUES[color] + 3) {
    const homeIndex = position - HOME_BASE_VALUES[color]; // 0, 1, 2, 3
    const homePawnIndex = HOME_PAWN_INDICES[color][homeIndex];
    const homePawn = HOME_PAWNS[homePawnIndex];
    return center(homePawn.label, cellSize, padding, showHeaders);
  }
  
  // Fallback - retour à la première position home
  const homePawnIndex = HOME_PAWN_INDICES[color][pawnIndex];
  const homePawn = HOME_PAWNS[homePawnIndex];
  return center(homePawn.label, cellSize, padding, showHeaders);
}

/**
 * Retourne les positions des 4 pions d'un joueur
 */
export function getPlayerPawnPositions(
  playerPositions: number[],
  color: Color,
  cellSize: number,
  padding: number,
  showHeaders: boolean = true
): PawnPosition[] {
  return playerPositions.map((position, index) => 
    positionToCoordinates(position, color, index, cellSize, padding, showHeaders)
  );
}

/**
 * Calcule l'offset pour les pions empilés sur la même case
 */
export function calculateStackOffset(
  indexInGroup: number,
  totalInGroup: number,
  cellSize: number
): { dx: number; dy: number } {
  if (totalInGroup <= 1) {
    return { dx: 0, dy: 0 };
  }
  
  const offset = cellSize * 0.25; // 25% de la taille de cellule
  
  if (totalInGroup === 2) {
    // Décalage horizontal
    return indexInGroup === 0 
      ? { dx: -offset, dy: 0 } 
      : { dx: offset, dy: 0 };
  }
  
  if (totalInGroup === 3) {
    // Triangle : haut-centre, bas-gauche, bas-droit
    const positions = [
      { dx: 0, dy: -offset * 0.8 },
      { dx: -offset, dy: offset * 0.5 },
      { dx: offset, dy: offset * 0.5 }
    ];
    return positions[indexInGroup] || { dx: 0, dy: 0 };
  }
  
  // 4 pions : grille 2x2
  const positions = [
    { dx: -offset * 0.7, dy: -offset * 0.7 },
    { dx: offset * 0.7, dy: -offset * 0.7 },
    { dx: -offset * 0.7, dy: offset * 0.7 },
    { dx: offset * 0.7, dy: offset * 0.7 }
  ];
  return positions[indexInGroup] || { dx: 0, dy: 0 };
}