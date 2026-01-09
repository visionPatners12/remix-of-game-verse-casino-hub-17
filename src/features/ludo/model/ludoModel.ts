export type Color = "R"|"G"|"Y"|"B";

export const TRACK = [
  "G02","G03","G04","G05","G06","G07","F07","E07","D07","C07","B07","A07",
  "A08","A09","B09","C09","D09","E09","F09","G09","G10","G11","G12","G13","G14","G15",
  "H15","I15","I14","I13","I12","I11","I10","I09","J09","K09","L09","M09","N09","O09",
  "O08","O07","N07","M07","L07","K07","J07","I07","I06","I05","I04","I03","I02","I01",
  "H01","G01"
] as const;

export const TRACK_LEN = TRACK.length; // 56
export const START_INDEX = { R:0, G:14, Y:28, B:42 } as const;
export const ENTRY_INDEX = { R:54, G:12, Y:28, B:40 } as const;
export const SAFE_BASE   = { R:100, G:200, Y:300, B:400 } as const;
export const SAFE_LEN    = 6 as const;

// Système de prison avec ordre de capture (20 slots par couleur)
export const PRISON_BASE = { R: -100, G: -200, Y: -300, B: -400 } as const;
export const PRISON_SLOTS_COUNT = 20 as const;
export const PRISON = PRISON_BASE; // Compatibilité

export const HOME_BASE = { R: -10, G: -20, Y: -30, B: -40 } as const;
export const GOAL = 999;

/**
 * Trouve le prochain slot de prison disponible pour une couleur donnée
 */
export function getNextPrisonSlot(gameState: Positions, prisonColor: Color): number {
  const base = PRISON_BASE[prisonColor];
  const allPositions = Object.values(gameState).flat();
  
  for (let i = 0; i < PRISON_SLOTS_COUNT; i++) {
    const slot = base - i; // -100, -101, -102, ..., -119
    if (!allPositions.includes(slot)) {
      return slot;
    }
  }
  
  return base - (PRISON_SLOTS_COUNT - 1);
}

/**
 * Vérifie si une position est dans la prison d'une couleur donnée
 */
export function isInPrison(position: number, prisonColor: Color): boolean {
  const base = PRISON_BASE[prisonColor];
  return position <= base && position > base - PRISON_SLOTS_COUNT;
}

export type Positions = { R:number[]; G:number[]; Y:number[]; B:number[] };

export function forward(pos:number, steps:number){ return (pos + steps) % TRACK_LEN; }

export function canEnterSafe(color: Color, pos: number, steps: number) {
  const entry = ENTRY_INDEX[color];
  const dist = (entry - pos + TRACK_LEN) % TRACK_LEN;      // cases jusqu'à la porte
  if (steps <= dist) return { enter:false, loopTo: forward(pos, steps) };
  const rem = steps - dist - 1;                            // 1 pas = porte → 1ʳᵉ safe
  if (rem > SAFE_LEN) return { invalid:true };
  if (rem === SAFE_LEN) return { enter:true, goal:true };
  return { enter:true, safeTo: SAFE_BASE[color] + rem };   // 0..4
}