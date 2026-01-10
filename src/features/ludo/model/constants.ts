export type Row = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O';
export type Column = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export const BOARD_CONFIG = {
  GRID_SIZE: 15,
  ROWS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'] as const,
  COLUMNS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
} as const;

// Classic elegant colors - soft and warm
export const LUDO_COLORS = {
  RED: '#E25B5B',      // Soft coral red
  GREEN: '#4CAF7A',    // Sage green
  YELLOW: '#E8C547',   // Warm gold
  BLUE: '#5B8EC2',     // Soft sky blue
  WHITE: '#FAF8F5',    // Warm white
  BLACK: '#2D2D2D',    // Soft black
} as const;

// Subtle accent colors for highlights
export const NEON_GLOW = {
  RED: '#F08080',      // Light coral
  GREEN: '#7BC99A',    // Light sage
  YELLOW: '#F0D878',   // Light gold
  BLUE: '#87AECE',     // Light sky
} as const;

// Soft tinted backgrounds
export const TINTED_COLORS = {
  RED: 'rgba(226, 91, 91, 0.12)',
  GREEN: 'rgba(76, 175, 122, 0.12)',
  YELLOW: 'rgba(232, 197, 71, 0.12)',
  BLUE: 'rgba(91, 142, 194, 0.12)',
} as const;

// Warm board colors - classic wood/cream aesthetic
export const BOARD_COLORS = {
  BACKGROUND: '#F5F0E8',      // Warm cream
  GRID_LINE: '#D4C8B8',       // Soft tan
  GRID_GLOW: '#C4B8A8',       // Muted warm
  NEBULA_1: '#EDE6DC',        // Light cream
  NEBULA_2: '#E8E2D8',        // Soft ivory
} as const;

export const HOME_AREAS = {
  RED: { rows: ['A', 'F'] as const, cols: [1, 6] as const },
  GREEN: { rows: ['A', 'F'] as const, cols: [10, 15] as const },
  YELLOW: { rows: ['J', 'O'] as const, cols: [10, 15] as const },
  BLUE: { rows: ['J', 'O'] as const, cols: [1, 6] as const },
} as const;

export const WHITE_SQUARES = {
  RED: { rows: ['B', 'E'] as const, cols: [2, 5] as const },
  GREEN: { rows: ['B', 'E'] as const, cols: [11, 14] as const },
  YELLOW: { rows: ['K', 'N'] as const, cols: [11, 14] as const },
  BLUE: { rows: ['K', 'N'] as const, cols: [2, 5] as const },
} as const;

export const HOME_PAWNS = [
  // Red pawns
  { label: 'B2', color: LUDO_COLORS.RED },
  { label: 'B5', color: LUDO_COLORS.RED },
  { label: 'E2', color: LUDO_COLORS.RED },
  { label: 'E5', color: LUDO_COLORS.RED },
  
  // Green pawns
  { label: 'B11', color: LUDO_COLORS.GREEN },
  { label: 'B14', color: LUDO_COLORS.GREEN },
  { label: 'E11', color: LUDO_COLORS.GREEN },
  { label: 'E14', color: LUDO_COLORS.GREEN },
  
  // Yellow pawns
  { label: 'K11', color: LUDO_COLORS.YELLOW },
  { label: 'K14', color: LUDO_COLORS.YELLOW },
  { label: 'N11', color: LUDO_COLORS.YELLOW },
  { label: 'N14', color: LUDO_COLORS.YELLOW },
  
  // Blue pawns
  { label: 'K2', color: LUDO_COLORS.BLUE },
  { label: 'K5', color: LUDO_COLORS.BLUE },
  { label: 'N2', color: LUDO_COLORS.BLUE },
  { label: 'N5', color: LUDO_COLORS.BLUE },
] as const;

export const START_CELLS = [
  { label: 'G2', color: LUDO_COLORS.RED },
  { label: 'B9', color: LUDO_COLORS.GREEN },
  { label: 'I14', color: LUDO_COLORS.YELLOW },
  { label: 'N7', color: LUDO_COLORS.BLUE },
] as const;

export const SAFE_CORRIDORS = [
  // Red safe corridor: H2, H3, H4, H5, H6, H7 (6 cases)
  { label: 'H2', color: LUDO_COLORS.RED },
  { label: 'H3', color: LUDO_COLORS.RED },
  { label: 'H4', color: LUDO_COLORS.RED },
  { label: 'H5', color: LUDO_COLORS.RED },
  { label: 'H6', color: LUDO_COLORS.RED },
  { label: 'H7', color: LUDO_COLORS.RED },
  
  // Green safe corridor: B8, C8, D8, E8, F8, G8 (6 cases)
  { label: 'B8', color: LUDO_COLORS.GREEN },
  { label: 'C8', color: LUDO_COLORS.GREEN },
  { label: 'D8', color: LUDO_COLORS.GREEN },
  { label: 'E8', color: LUDO_COLORS.GREEN },
  { label: 'F8', color: LUDO_COLORS.GREEN },
  { label: 'G8', color: LUDO_COLORS.GREEN },
  
  // Yellow safe corridor: H14, H13, H12, H11, H10, H9 (6 cases)
  { label: 'H14', color: LUDO_COLORS.YELLOW },
  { label: 'H13', color: LUDO_COLORS.YELLOW },
  { label: 'H12', color: LUDO_COLORS.YELLOW },
  { label: 'H11', color: LUDO_COLORS.YELLOW },
  { label: 'H10', color: LUDO_COLORS.YELLOW },
  { label: 'H9', color: LUDO_COLORS.YELLOW },
  
  // Blue safe corridor: N8, M8, L8, K8, J8, I8 (6 cases)
  { label: 'N8', color: LUDO_COLORS.BLUE },
  { label: 'M8', color: LUDO_COLORS.BLUE },
  { label: 'L8', color: LUDO_COLORS.BLUE },
  { label: 'K8', color: LUDO_COLORS.BLUE },
  { label: 'J8', color: LUDO_COLORS.BLUE },
  { label: 'I8', color: LUDO_COLORS.BLUE },
] as const;

// EXTRA_DOTS removed - H7, G8, H9, I8 are now the 6th cells of safe corridors
export const EXTRA_DOTS: { label: string; color: string }[] = [];

export const PLAYER_INFO_CELLS = {
  RED: 'A1',
  GREEN: 'A15', 
  YELLOW: 'O15',
  BLUE: 'O1',
} as const;

export const PRISON_SLOTS = {
  RED: [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
    'B6', 'C6', 'D6', 'E6',
    'F6', 'F5', 'F4', 'F3', 'F2', 'F1'
  ],
  GREEN: [
    'A10', 'A11', 'A12', 'A13', 'A14', 'A15',
    'B15', 'C15', 'D15', 'E15',
    'F15', 'F14', 'F13', 'F12', 'F11', 'F10'
  ],
  YELLOW: [
    'J10', 'J11', 'J12', 'J13', 'J14', 'J15',
    'K15', 'L15', 'M15', 'N15',
    'O15', 'O14', 'O13', 'O12', 'O11', 'O10'
  ],
  BLUE: [
    'J1', 'J2', 'J3', 'J4', 'J5', 'J6',
    'K6', 'L6', 'M6', 'N6',
    'O6', 'O5', 'O4', 'O3', 'O2', 'O1'
  ]
} as const;

// Goal slots for finished pawns (position 999) - on same border as prison
export const GOAL_SLOTS = {
  RED: ['E1', 'D1', 'C1', 'B1'],      // End of RED border (after prison)
  GREEN: ['E10', 'D10', 'C10', 'B10'], // End of GREEN border
  YELLOW: ['N10', 'M10', 'L10', 'K10'], // End of YELLOW border
  BLUE: ['N1', 'M1', 'L1', 'K1'],      // End of BLUE border
} as const;

export const DEFAULT_PROPS = {
  CELL_SIZE: 40,
  PADDING: 24,
  SHOW_HEADERS: true,
  HOME_OPACITY: 0.12,
  PRISON_RADIUS: 0.32,
} as const;