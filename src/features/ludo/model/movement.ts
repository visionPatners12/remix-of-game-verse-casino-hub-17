import { Color, TRACK, TRACK_LEN, START_INDEX, ENTRY_INDEX, SAFE_BASE, SAFE_LEN, PRISON, PRISON_BASE, PRISON_SLOTS_COUNT, getNextPrisonSlot, isInPrison as isInPrisonHelper, HOME_BASE, GOAL } from './ludoModel';

/**
 * Vérifie si un pion est dans n'importe quelle prison
 */
export function isInAnyPrison(pos: number): boolean {
  return (['R', 'G', 'Y', 'B'] as Color[]).some(color => isInPrisonHelper(pos, color));
}

/**
 * Résultat d'un mouvement de pion
 */
export interface MoveResult {
  valid: boolean;
  newPosition: number;
  capturedPawn?: { color: Color; pawnIndex: number };
  canRollAgain?: boolean; // Pour le 6 ou capture
  reason?: string;
}

/**
 * État du plateau avec toutes les positions
 */
export interface GameState {
  R: number[];
  G: number[];
  Y: number[];
  B: number[];
}

/**
 * Vérifie si un pion est dans sa propre prison (ne devrait jamais arriver)
 */
function isInOwnPrison(position: number, color: Color): boolean {
  return isInPrisonHelper(position, color);
}

/**
 * Vérifie si un pion est dans une prison adverse
 */
export function isInEnemyPrison(position: number, color: Color): boolean {
  const colors = (['R', 'G', 'Y', 'B'] as Color[]).filter(c => c !== color);
  return colors.some(c => isInPrisonHelper(position, c));
}

/**
 * Vérifie si un pion est dans sa zone HOME
 * HOME positions are negative: e.g. Red = -10, -11, -12, -13
 */
function isInHome(position: number, color: Color): boolean {
  const homeStart = HOME_BASE[color];
  return position <= homeStart && position >= homeStart - 3;
}

/**
 * Trouve une position HOME libre pour un pion qui sort de prison
 */
function findFreeHomePosition(gameState: GameState, color: Color): number {
  const homeStart = HOME_BASE[color];
  for (let i = 0; i <= 3; i++) {
    const homePos = homeStart - i;
    const occupied = gameState[color].includes(homePos);
    if (!occupied) return homePos;
  }
  return homeStart;
}

/**
 * Vérifie si un pion peut sortir (prison ou home) avec un dé de 6
 */
export function canExitYard(diceValue: number): boolean {
  return diceValue === 6;
}

/**
 * Trouve tous les pions adverses sur une position donnée
 */
function findPawnsAtPosition(gameState: GameState, position: number, excludeColor: Color): Array<{ color: Color; pawnIndex: number }> {
  const found: Array<{ color: Color; pawnIndex: number }> = [];
  
  const colors: Color[] = ['R', 'G', 'Y', 'B'];
  for (const color of colors) {
    if (color === excludeColor) continue;
    
    gameState[color].forEach((pos, index) => {
      if (pos === position) {
        found.push({ color, pawnIndex: index });
      }
    });
  }
  
  return found;
}

/**
 * Vérifie si une position est dans un couloir de sécurité
 */
function isInSafeCorridor(position: number): boolean {
  return position >= 100 && position < 1000;
}

/**
 * Vérifie si une case de la piste contient une "blockade" : 2+ pions de la même couleur
 * Une blockade empêche tout adversaire de traverser cette case
 */
function hasBlockOnTrack(gameState: GameState, position: number): boolean {
  if (position < 0 || position >= TRACK_LEN) return false;
  const colors: Color[] = ['R', 'G', 'Y', 'B'];
  for (const c of colors) {
    let count = 0;
    for (const pos of gameState[c]) {
      if (pos === position) count++;
      if (count >= 2) return true;
    }
  }
  return false;
}

/**
 * Calcule le mouvement d'un pion selon les règles du Ludo
 */
export function calculateMove(
  gameState: GameState,
  color: Color,
  pawnIndex: number,
  diceValue: number
): MoveResult {
  const currentPosition = gameState[color][pawnIndex];
  
  // CAS 1: Pion dans une prison ADVERSE (peut sortir avec un 6)
  if (isInEnemyPrison(currentPosition, color)) {
    if (!canExitYard(diceValue)) {
      return {
        valid: false,
        newPosition: currentPosition,
        reason: "Sortie de prison uniquement sur 6"
      };
    }
    
    // Trouver une position HOME libre
    const freeHomePos = findFreeHomePosition(gameState, color);
    return {
      valid: true,
      newPosition: freeHomePos,
      canRollAgain: true,
      reason: "Sortie de prison vers HOME"
    };
  }
  
  // CAS 2: Pion dans sa zone HOME (peut sortir avec un 6)
  if (isInHome(currentPosition, color)) {
    if (!canExitYard(diceValue)) {
      return {
        valid: false,
        newPosition: currentPosition,
        reason: "Sortie de Home uniquement sur 6"
      };
    }
    
    // Aller à la position START
    const startPos = START_INDEX[color];
    const pawnsAtStart = findPawnsAtPosition(gameState, startPos, color);
    const capturedPawn = pawnsAtStart.length > 0 ? pawnsAtStart[0] : undefined;
    
    return {
      valid: true,
      newPosition: startPos,
      capturedPawn,
      canRollAgain: true,
      reason: "Exit from Home to track"
    };
  }
  
  // CAS 3: Pion dans sa propre prison (ERREUR - ne devrait jamais arriver)
  if (isInOwnPrison(currentPosition, color)) {
    console.error(`🚨 ERROR: Pawn ${color}-${pawnIndex} in its own prison ${currentPosition}`);
    return {
      valid: false,
      newPosition: currentPosition,
      reason: "Error: pawn in its own prison"
    };
  }
  
  // Cas 2: Pion au goal (centre)
  if (currentPosition === GOAL) {
    return {
      valid: false,
      newPosition: GOAL,
      reason: "Pawn has already reached goal"
    };
  }
  
  // Cas 3: Pion dans le couloir de sécurité
  if (isInSafeCorridor(currentPosition)) {
    const safeIndex = currentPosition - SAFE_BASE[color];
    const newSafeIndex = safeIndex + diceValue;
    
    if (newSafeIndex > SAFE_LEN) {
      return {
        valid: false,
        newPosition: currentPosition,
        reason: "Overshooting safe corridor, exact landing required"
      };
    }
    
    if (newSafeIndex === SAFE_LEN) {
      return {
        valid: true,
        newPosition: GOAL,
        reason: "Reached the goal!"
      };
    }
    
    return {
      valid: true,
      newPosition: SAFE_BASE[color] + newSafeIndex
    };
  }
  
  // Cas 4: Pion sur la piste principale
  if (currentPosition >= 0 && currentPosition < TRACK_LEN) {
    const entryIndex = ENTRY_INDEX[color];
    const distanceToEntry = (entryIndex - currentPosition + TRACK_LEN) % TRACK_LEN;
    
    // a) Le mouvement reste sur la piste
    if (diceValue <= distanceToEntry) {
      // Vérifie les cases INTERMÉDIAIRES 1..diceValue-1 pour une blockade
      for (let step = 1; step < diceValue; step++) {
        const pos = (currentPosition + step) % TRACK_LEN;
        if (hasBlockOnTrack(gameState, pos)) {
          return {
            valid: false,
            newPosition: currentPosition,
            reason: "Blockade on track, cannot pass through",
          };
        }
      }

      // Mouvement normal sur la piste
      const newPosition = (currentPosition + diceValue) % TRACK_LEN;
      const pawnsAtDestination = findPawnsAtPosition(gameState, newPosition, color);
      
      let capturedPawn: { color: Color; pawnIndex: number } | undefined;

      if (pawnsAtDestination.length > 0) {
        const candidate = pawnsAtDestination[0];

        // 🔒 Protection START_INDEX :
        // si le pion qu'on veut capturer est sur SA propre case de départ,
        // on autorise le move, mais SANS capture → ils partagent la case
        if (newPosition === START_INDEX[candidate.color]) {
          capturedPawn = undefined;
        } else {
          capturedPawn = candidate;
        }
      }

      return {
        valid: true,
        newPosition,
        capturedPawn,
        canRollAgain: capturedPawn !== undefined,
      };
    }

    // b) Le mouvement rentre dans le couloir
    // On interdit de traverser une blockade sur les steps 1..distanceToEntry
    for (let step = 1; step <= distanceToEntry; step++) {
      const pos = (currentPosition + step) % TRACK_LEN;
      if (hasBlockOnTrack(gameState, pos)) {
        return {
          valid: false,
          newPosition: currentPosition,
          reason: "Blockade on track, cannot pass through",
        };
      }
    }

    const stepsInSafe = diceValue - distanceToEntry - 1;

    if (stepsInSafe > SAFE_LEN) {
      return {
        valid: false,
        newPosition: currentPosition,
        reason: "Overshooting safe corridor, exact landing required",
      };
    }

    if (stepsInSafe === SAFE_LEN) {
      return {
        valid: true,
        newPosition: GOAL,
        reason: "Reached goal via safe corridor!",
      };
    }

    return {
      valid: true,
      newPosition: SAFE_BASE[color] + stepsInSafe,
    };
  }

  // Position invalide
  return {
    valid: false,
    newPosition: currentPosition,
    reason: "Position invalide",
  };
}

/**
 * Applique un mouvement au state du jeu
 */
export function applyMove(
  gameState: GameState,
  color: Color,
  pawnIndex: number,
  moveResult: MoveResult
): GameState {
  if (!moveResult.valid) return gameState;
  
  const newState = {
    R: [...gameState.R],
    G: [...gameState.G],
    Y: [...gameState.Y],
    B: [...gameState.B]
  };
  
  // 🎮 LOG Frontend: Avant le mouvement
  console.log(`🎮 Frontend - Pion ${color}-${pawnIndex}: ${gameState[color][pawnIndex]} → ${moveResult.newPosition}`);
  
  // Déplacer le pion
  newState[color][pawnIndex] = moveResult.newPosition;
  
  // Capturer un pion adverse si nécessaire
  if (moveResult.capturedPawn) {
    const { color: capturedColor, pawnIndex: capturedIndex } = moveResult.capturedPawn;
    
    // Trouver le prochain slot de prison libre
    const prisonSlot = getNextPrisonSlot(gameState, color);
    
    console.log(`🔥 Frontend - CAPTURE: Pion ${capturedColor}-${capturedIndex} → slot prison ${prisonSlot} (joueur ${color})`);
    newState[capturedColor][capturedIndex] = prisonSlot;
  }
  
  return newState;
}

/**
 * Trouve tous les mouvements possibles pour un joueur
 */
export function getPossibleMoves(
  gameState: GameState,
  color: Color,
  diceValue: number
): Array<{ pawnIndex: number; moveResult: MoveResult }> {
  const possibleMoves: Array<{ pawnIndex: number; moveResult: MoveResult }> = [];
  
  for (let pawnIndex = 0; pawnIndex < 4; pawnIndex++) {
    const moveResult = calculateMove(gameState, color, pawnIndex, diceValue);
    if (moveResult.valid) {
      possibleMoves.push({ pawnIndex, moveResult });
    }
  }
  
  return possibleMoves;
}

/**
 * Vérifie si un joueur a des mouvements possibles
 */
export function hasValidMoves(
  gameState: GameState,
  color: Color,
  diceValue: number
): boolean {
  return getPossibleMoves(gameState, color, diceValue).length > 0;
}