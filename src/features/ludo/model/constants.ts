export type Row = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O';
export type Column = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export const BOARD_CONFIG = {
  GRID_SIZE: 15,
  ROWS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'] as const,
  COLUMNS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
} as const;

export const LUDO_COLORS = {
  RED: '#ff1a4d',
  GREEN: '#00ff88', 
  YELLOW: '#ffea00',
  BLUE: '#00d4ff',
  WHITE: '#ffffff',
  BLACK: '#000000',
} as const;

// Neon glow colors for futuristic effects
export const NEON_GLOW = {
  RED: '#ff6b8a',
  GREEN: '#4dffb3',
  YELLOW: '#fff566',
  BLUE: '#66e0ff',
} as const;

// Dark tinted versions for backgrounds
export const TINTED_COLORS = {
  RED: 'rgba(255, 26, 77, 0.15)',
  GREEN: 'rgba(0, 255, 136, 0.15)',
  YELLOW: 'rgba(255, 234, 0, 0.15)',
  BLUE: 'rgba(0, 212, 255, 0.15)',
} as const;

// Futuristic board colors
export const BOARD_COLORS = {
  BACKGROUND: '#0a0a1a',
  GRID_LINE: '#1a3a4a',
  GRID_GLOW: '#00ffff',
  NEBULA_1: '#1a0a2e',
  NEBULA_2: '#0a1a1a',
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
  RED: ['E1', 'D1', 'C1', 'B1'],         // Left side (RED home area)
  GREEN: ['E15', 'D15', 'C15', 'B15'],   // Right side (GREEN home area)
  YELLOW: ['N15', 'M15', 'L15', 'K15'], // Right side (YELLOW home area)
  BLUE: ['N1', 'M1', 'L1', 'K1'],        // Left side (BLUE home area)
} as const;

export const DEFAULT_PROPS = {
  CELL_SIZE: 40,
  PADDING: 24,
  SHOW_HEADERS: true,
  HOME_OPACITY: 0.12,
  PRISON_RADIUS: 0.32,
} as const;