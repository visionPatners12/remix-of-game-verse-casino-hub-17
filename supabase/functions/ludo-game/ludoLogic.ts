export type Color = "R" | "G" | "Y" | "B";

export const TRACK = [
  "G02","G03","G04","G05","G06","G07","F07","E07","D07","C07","B07","A07",
  "A08","A09","B09","C09","D09","E09","F09","G09","G10","G11","G12","G13","G14","G15",
  "H15","I15","I14","I13","I12","I11","I10","I09","J09","K09","L09","M09","N09","O09",
  "O08","O07","N07","M07","L07","K07","J07","I07","I06","I05","I04","I03","I02","I01",
  "H01","G01"
] as const;

export const TRACK_LEN = TRACK.length; // 56

// Indices de départ sur la piste
export const START_INDEX = { R: 0, G: 14, Y: 28, B: 42 } as const;

// Entrée du couloir de couleur sur la piste
export const ENTRY_INDEX = { R: 54, G: 12, Y: 28, B: 40 } as const;

// Base du couloir sécurisé (safe path)
export const SAFE_BASE = { R: 100, G: 200, Y: 300, B: 400 } as const;
// 6 cases visibles (base + 0..5), puis GOAL quand newSafeIndex === 6
export const SAFE_LEN = 6 as const;

// Prisons : 20 slots par couleur
export const PRISON_BASE = { R: -100, G: -200, Y: -300, B: -400 } as const;
export const PRISON_SLOTS_COUNT = 20 as const;

// Zones de Home (4 cases par couleur)
export const HOME_BASE = { R: -10, G: -20, Y: -30, B: -40 } as const;

// But final
export const GOAL = 999;

export interface GameState {
  R: number[];
  G: number[];
  Y: number[];
  B: number[];
}

export interface MoveResult {
  valid: boolean;
  newPosition: number;
  capturedPawn?: { color: Color; pawnIndex: number };
  canRollAgain?: boolean;
  reason?: string;
}

// ---------- Utilitaires positions ----------

// Prison = n'importe quel slot dans la plage d'une des prisons (R,G,Y,B)
function isInPrison(position: number): boolean {
  const colors: Color[] = ["R", "G", "Y", "B"];
  for (const c of colors) {
    const base = PRISON_BASE[c];
    if (position <= base && position > base - PRISON_SLOTS_COUNT) {
      return true;
    }
  }
  return false;
}

function isInHome(position: number, color: Color): boolean {
  const base = HOME_BASE[color]; // ex: -10 pour R
  // slots: -10, -11, -12, -13
  return position <= base && position >= base - 3;
}

// case Home dédiée pour un pion donné
function getHomeSlot(color: Color, pawnIndex: number): number {
  // R: [-10, -11, -12, -13] → index 0..3
  // G: [-20, -21, -22, -23], etc.
  return HOME_BASE[color] - pawnIndex;
}

/**
 * Donne le prochain slot libre de la prison "prisonColor".
 * IMPORTANT : si tu veux "prison du CAPTUREUR", tu dois appeler getNextPrisonSlot(state, capturerColor)
 */
export function getNextPrisonSlot(gameState: GameState, prisonColor: Color): number {
  const base = PRISON_BASE[prisonColor];
  const allPositions = Object.values(gameState).flat();

  for (let i = 0; i < PRISON_SLOTS_COUNT; i++) {
    const slot = base - i; // -100, -101, ..., -119
    if (!allPositions.includes(slot)) {
      return slot;
    }
  }
  return base - (PRISON_SLOTS_COUNT - 1);
}

function canExitYard(diceValue: number): boolean {
  return diceValue === 6;
}

function findPawnsAtPosition(
  gameState: GameState,
  position: number,
  excludeColor: Color,
): Array<{ color: Color; pawnIndex: number }> {
  const found: Array<{ color: Color; pawnIndex: number }> = [];
  const colors: Color[] = ["R", "G", "Y", "B"];

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

// True si une case de la piste contient une "blockade" : 2+ pions de la même couleur
function hasBlockOnTrack(gameState: GameState, position: number): boolean {
  if (position < 0 || position >= TRACK_LEN) return false;
  const colors: Color[] = ["R", "G", "Y", "B"];
  for (const c of colors) {
    let count = 0;
    for (const pos of gameState[c]) {
      if (pos === position) count++;
      if (count >= 2) return true;
    }
  }
  return false;
}

// ✅ Blockade ENNEMIE sur une case (2+ pions d'une même couleur adverse)
function hasEnemyBlockOnTrack(gameState: GameState, position: number, mover: Color): boolean {
  if (position < 0 || position >= TRACK_LEN) return false;
  const colors: Color[] = ["R", "G", "Y", "B"];
  for (const c of colors) {
    if (c === mover) continue;
    let count = 0;
    for (const pos of gameState[c]) {
      if (pos === position) count++;
      if (count >= 2) return true;
    }
  }
  return false;
}

// ---------- Logique de mouvement ----------

export function calculateMove(
  gameState: GameState,
  color: Color,
  pawnIndex: number,
  diceValue: number,
): MoveResult {
  const currentPosition = gameState[color][pawnIndex];

  // Cas 0: Pion en Home
  if (isInHome(currentPosition, color)) {
    if (diceValue !== 6) {
      return { valid: false, newPosition: currentPosition, reason: "Sortie de Home uniquement sur 6" };
    }

    const startPos = START_INDEX[color];

    // ✅ interdit d'entrer sur une blockade ennemie
    if (hasEnemyBlockOnTrack(gameState, startPos, color)) {
      return { valid: false, newPosition: currentPosition, reason: "Blockade ennemie sur la case de départ" };
    }

    const pawnsAtStart = findPawnsAtPosition(gameState, startPos, color);
    const capturedPawn = pawnsAtStart.length > 0 ? pawnsAtStart[0] : undefined;

    return { valid: true, newPosition: startPos, capturedPawn, canRollAgain: true };
  }

  // Cas 1: Pion en prison
  if (isInPrison(currentPosition)) {
    if (!canExitYard(diceValue)) {
      return { valid: false, newPosition: currentPosition, reason: "Sortie de prison uniquement sur 6" };
    }

    const homePos = getHomeSlot(color, pawnIndex);
    const pawnsAtHome = findPawnsAtPosition(gameState, homePos, color);
    const capturedPawn = pawnsAtHome.length > 0 ? pawnsAtHome[0] : undefined;

    return { valid: true, newPosition: homePos, capturedPawn, canRollAgain: true };
  }

  // Cas 2: Pion déjà arrivé
  if (currentPosition === GOAL) {
    return { valid: false, newPosition: GOAL, reason: "Le pion est déjà arrivé" };
  }

  // Cas 3: Couloir sécurisé
  if (currentPosition >= 100 && currentPosition < 1000) {
    const safeIndex = currentPosition - SAFE_BASE[color]; // 0..5
    const newSafeIndex = safeIndex + diceValue;

    if (newSafeIndex > SAFE_LEN) {
      return { valid: false, newPosition: currentPosition, reason: "Dépassement du couloir, arrivée exacte requise" };
    }
    if (newSafeIndex === SAFE_LEN) {
      return { valid: true, newPosition: GOAL, reason: "Arrivée au centre !" };
    }
    return { valid: true, newPosition: SAFE_BASE[color] + newSafeIndex };
  }

  // Cas 4: Piste principale
  if (currentPosition >= 0 && currentPosition < TRACK_LEN) {
    const entryIndex = ENTRY_INDEX[color];
    const distanceToEntry = (entryIndex - currentPosition + TRACK_LEN) % TRACK_LEN;

    // a) reste sur la piste
    if (diceValue <= distanceToEntry) {
      // vérifie blockade traversée
      for (let step = 1; step < diceValue; step++) {
        const pos = ((currentPosition + step) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
        if (hasBlockOnTrack(gameState, pos)) {
          return { valid: false, newPosition: currentPosition, reason: "Blockade sur la piste, impossible de traverser" };
        }
      }

      const newPosition = ((currentPosition + diceValue) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;

      // ✅ interdit d'atterrir sur une blockade ennemie
      if (hasEnemyBlockOnTrack(gameState, newPosition, color)) {
        return { valid: false, newPosition: currentPosition, reason: "Blockade ennemie sur la case d’arrivée" };
      }

      const pawnsAtDestination = findPawnsAtPosition(gameState, newPosition, color);

      let capturedPawn: { color: Color; pawnIndex: number } | undefined;

      if (pawnsAtDestination.length > 0) {
        const candidate = pawnsAtDestination[0];

        // Protection START_INDEX (pas de capture sur la case de départ de l’adversaire)
        if (newPosition === START_INDEX[candidate.color]) capturedPawn = undefined;
        else capturedPawn = candidate;
      }

      return { valid: true, newPosition, capturedPawn, canRollAgain: capturedPawn !== undefined };
    }

    // b) rentre dans le couloir
    for (let step = 1; step <= distanceToEntry; step++) {
      const pos = ((currentPosition + step) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      if (hasBlockOnTrack(gameState, pos)) {
        return { valid: false, newPosition: currentPosition, reason: "Blockade sur la piste, impossible de traverser" };
      }
    }

    const stepsInSafe = diceValue - distanceToEntry - 1;

    if (stepsInSafe > SAFE_LEN) {
      return { valid: false, newPosition: currentPosition, reason: "Dépassement du couloir" };
    }

    if (stepsInSafe === SAFE_LEN) {
      return { valid: true, newPosition: GOAL, reason: "Arrivée au centre via le couloir !" };
    }

    return { valid: true, newPosition: SAFE_BASE[color] + stepsInSafe };
  }

  return { valid: false, newPosition: currentPosition, reason: "Position invalide sur la piste" };
}
