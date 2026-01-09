/**
 * Game logic hook - pure business logic for Ludo game
 * Handles move calculations, position checks, and game state validation
 */

import { useMemo, useCallback } from 'react';
import { isInEnemyPrison } from '../model/movement';
import { START_INDEX, HOME_BASE, SAFE_BASE, SAFE_LEN, TRACK_LEN, GOAL, canEnterSafe } from '../model/ludoModel';
import type { Color, Positions, UIMove } from '../types';
import { logger } from '@/utils/logger';

/**
 * Color names mapping
 */
const COLOR_NAMES: Record<Color, string> = {
  'R': 'RED',
  'G': 'GREEN',
  'Y': 'YELLOW',
  'B': 'BLUE'
};

/**
 * Hook for Ludo game logic calculations
 */
export const useLudoGameLogic = () => {
  /**
   * Check if a pawn is at home base
   */
  const isAtHome = useCallback((position: number, color: Color): boolean => {
    const base = HOME_BASE[color];
    // Tolerant: -20..-17 or -20..-23 depending on conventions
    return (position >= base && position <= base + 3) || (position <= base && position >= base - 3);
  }, []);

  /**
   * Get display name for a color
   */
  const getColorName = useCallback((color: string): string => {
    return COLOR_NAMES[color as Color] || color;
  }, []);

  /**
   * Calculate possible moves after dice roll with target information
   */
  const calculatePossibleMoves = useCallback((
    diceValue: number,
    playerColor: string,
    positions: Positions
  ): UIMove[] => {
    if (!positions || !playerColor) return [];

    const playerPositions: number[] = positions[playerColor as Color] ?? [-10, -11, -12, -13];
    const res: UIMove[] = [];

    logger.debug('🎲 calculatePossibleMoves:', {
      diceValue,
      playerColor,
      positions: playerPositions,
      safeBase: SAFE_BASE[playerColor as Color]
    });

    for (let i = 0; i < 4; i++) {
      const pos = playerPositions[i];

      // 1) ENEMY PRISON → exit on 6 to HOME (backend calculates free position)
      if (isInEnemyPrison(pos, playerColor as Color) && diceValue === 6) {
        res.push({
          pawnIndex: i,
          from: 'prison',
          canExit: true,
          target: null, // Backend finds free HOME position
        });
        continue;
      }

      // 2) HOME → exit on 6 to START_INDEX
      if (isAtHome(pos, playerColor as Color) && diceValue === 6) {
        res.push({
          pawnIndex: i,
          from: 'home',
          canExit: true,
          target: START_INDEX[playerColor as Color],
        });
        continue;
      }

      // 3) SAFE CORRIDOR (100-105, 200-205, 300-305, 400-405) → move to GOAL or advance
      const safeBase = SAFE_BASE[playerColor as Color];
      if (pos >= safeBase && pos < safeBase + SAFE_LEN) {
        const safeIndex = pos - safeBase; // 0 to 5
        const newSafeIndex = safeIndex + diceValue;

        if (newSafeIndex === SAFE_LEN) {
          // Exact arrival at GOAL
          res.push({ pawnIndex: i, from: 'track', canExit: false, target: GOAL });
        } else if (newSafeIndex < SAFE_LEN) {
          // Advance in corridor
          res.push({ pawnIndex: i, from: 'track', canExit: false, target: safeBase + newSafeIndex });
        }
        // If newSafeIndex > SAFE_LEN → overshoot, no valid move
        continue;
      }

      // 4) On track (0-55) → normal movement with canEnterSafe
      if (pos >= 0 && pos < TRACK_LEN) {
        try {
          const info = canEnterSafe(playerColor as Color, pos, diceValue);
          if ((info as any).invalid) {
            // No move if corridor overshoot
          } else if ((info as any).enter && (info as any).goal) {
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: GOAL });
          } else if ((info as any).enter && typeof (info as any).safeTo === 'number') {
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: (info as any).safeTo });
          } else if (typeof (info as any).loopTo === 'number') {
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: (info as any).loopTo });
          } else {
            // Minimal fallback
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: null });
          }
        } catch {
          // On error, simple fallback
          res.push({ pawnIndex: i, from: 'track', canExit: false, target: null });
        }
      }
    }
    return res;
  }, [isAtHome]);

  /**
   * Check if it's the player's turn
   */
  const isPlayerTurn = useCallback((playerColor?: string, gameTurn?: string): boolean => {
    return !!playerColor && !!gameTurn && playerColor === gameTurn;
  }, []);

  /**
   * Check if game is active
   */
  const isGameActive = useCallback((status?: string): boolean => {
    return status === 'active';
  }, []);

  return {
    isAtHome,
    getColorName,
    calculatePossibleMoves,
    isPlayerTurn,
    isGameActive,
    COLOR_NAMES,
  };
};

export default useLudoGameLogic;
