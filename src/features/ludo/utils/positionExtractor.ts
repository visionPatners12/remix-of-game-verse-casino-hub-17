import type { Color, Positions } from '../model/ludoModel';
import { isInAnyPrison } from '../model/movement';

export interface PawnOnBoard {
  position: number;
  pawnIndex: number;
}

export interface PawnInfo {
  position: number;
  pawnIndex: number;
  color: Color;
  playerId: string;
}

export interface PawnGroup {
  position: number;
  pawns: PawnInfo[];
}

/**
 * Extrait les positions des pions sur le plateau (exclut les pions en prison)
 */
export function extractPlayerPositions(
  gamePositions: Positions | null | undefined,
  playerColor: Color
): PawnOnBoard[] {
  if (!gamePositions || !gamePositions[playerColor]) {
    return [];
  }
  
  const positions = gamePositions[playerColor];
  
  // Vérifier que nous avons exactement 4 positions
  if (!Array.isArray(positions) || positions.length !== 4) {
    return [];
  }
  
  // Retourner les pions sur le plateau et en Home (exclut prisons et GOAL)
  return positions
    .map((position, index) => ({ position, pawnIndex: index }))
    .filter(pawn => !isInAnyPrison(pawn.position) && pawn.position !== 999);
}

/**
 * Groupe tous les pions par position pour détecter les chevauchements
 */
export function groupPawnsByPosition(
  gamePositions: Positions | null | undefined,
  players: Array<{ id: string; color: string }>
): Map<number, PawnInfo[]> {
  const groups = new Map<number, PawnInfo[]>();
  
  if (!gamePositions) return groups;
  
  for (const player of players) {
    const color = player.color as Color;
    const pawns = extractPlayerPositions(gamePositions, color);
    
    for (const pawn of pawns) {
      const existing = groups.get(pawn.position) || [];
      existing.push({
        position: pawn.position,
        pawnIndex: pawn.pawnIndex,
        color,
        playerId: player.id
      });
      groups.set(pawn.position, existing);
    }
  }
  
  return groups;
}