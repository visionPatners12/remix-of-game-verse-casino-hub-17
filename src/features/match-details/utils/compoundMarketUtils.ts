// Compound Market Detection and Parsing Utilities

export interface CompoundMarketConfig {
  rowLabels: string[];
  columnLabels: string[];
  type: '2x3' | '2x2' | '3x2' | '2x4' | '4x2';
  rowHeader: string;
  columnHeader: string;
}

// Configuration for known compound markets
const COMPOUND_MARKET_PATTERNS: Record<string, CompoundMarketConfig> = {
  'Both Teams To Score & Full Time Result': {
    rowLabels: ['Yes', 'No'],
    columnLabels: ['1', 'X', '2'],
    type: '2x3',
    rowHeader: 'BTTS',
    columnHeader: 'Result'
  },
  'Both Teams To Score & Total': {
    rowLabels: ['Yes', 'No'],
    columnLabels: ['Over', 'Under'],
    type: '2x2',
    rowHeader: 'BTTS',
    columnHeader: 'Total'
  },
  'Full Time Result & Total Goals': {
    rowLabels: ['1', 'X', '2'],
    columnLabels: ['Over', 'Under'],
    type: '3x2',
    rowHeader: 'Result',
    columnHeader: 'Total'
  },
  'Total Goals Odd/Even & Total': {
    rowLabels: ['Even', 'Odd'],
    columnLabels: ['Over', 'Under'],
    type: '2x2',
    rowHeader: 'Odd/Even',
    columnHeader: 'Total'
  },
  'Both Teams To Score & Total Goals': {
    rowLabels: ['Yes', 'No'],
    columnLabels: ['Over', 'Under'],
    type: '2x2',
    rowHeader: 'BTTS',
    columnHeader: 'Total'
  },
  'Double Chance & Total': {
    rowLabels: ['1X', 'X2', '12'],
    columnLabels: ['Over', 'Under'],
    type: '3x2',
    rowHeader: 'Double Chance',
    columnHeader: 'Total'
  },
  'Double Chance & Both Teams To Score': {
    rowLabels: ['1X', 'X2', '12'],
    columnLabels: ['Yes', 'No'],
    type: '3x2',
    rowHeader: 'Double Chance',
    columnHeader: 'BTTS'
  }
};

/**
 * Check if a market is a compound market (contains "&")
 */
export function isCompoundMarket(marketName: string): boolean {
  return marketName.includes(' & ');
}

/**
 * Get configuration for a compound market
 */
export function getCompoundMarketConfig(marketName: string): CompoundMarketConfig | null {
  // Direct match first
  if (COMPOUND_MARKET_PATTERNS[marketName]) {
    return COMPOUND_MARKET_PATTERNS[marketName];
  }
  
  // Try partial matches for variations
  for (const [pattern, config] of Object.entries(COMPOUND_MARKET_PATTERNS)) {
    if (marketName.toLowerCase().includes(pattern.toLowerCase().split(' & ')[0]) &&
        marketName.toLowerCase().includes(pattern.toLowerCase().split(' & ')[1])) {
      return config;
    }
  }
  
  return null;
}

/**
 * Parse a compound selection name into row and column components
 * Examples: 
 * - "Yes & 1" → { row: "Yes", col: "1" }
 * - "No & Over (2.5)" → { row: "No", col: "Over" }
 */
export function parseCompoundSelection(selectionName: string): { row: string; col: string } | null {
  if (!selectionName.includes(' & ')) return null;
  
  const parts = selectionName.split(' & ');
  if (parts.length !== 2) return null;
  
  // Clean up parts - remove parenthetical values like "(2.5)"
  const cleanPart = (part: string) => {
    return part.replace(/\s*\([^)]*\)\s*$/, '').trim();
  };
  
  return { 
    row: cleanPart(parts[0]), 
    col: cleanPart(parts[1]) 
  };
}

/**
 * Normalize a label for comparison (handles variations like "Over" vs "Over (2.5)")
 */
export function normalizeLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
}

/**
 * Match a selection part to a config label
 */
export function matchLabel(selectionPart: string, configLabels: string[]): string | null {
  const normalized = normalizeLabel(selectionPart);
  
  for (const label of configLabels) {
    if (normalizeLabel(label) === normalized) {
      return label;
    }
  }
  
  return null;
}

/**
 * Format column label to show team names when appropriate
 */
export function formatColumnLabel(
  label: string, 
  homeTeam?: string, 
  awayTeam?: string
): string {
  if (label === '1' && homeTeam) return homeTeam;
  if (label === '2' && awayTeam) return awayTeam;
  if (label === 'X') return 'Draw';
  if (label === '1X' && homeTeam) return `${homeTeam}/Draw`;
  if (label === 'X2' && awayTeam) return `Draw/${awayTeam}`;
  if (label === '12' && homeTeam && awayTeam) return `${homeTeam}/${awayTeam}`;
  return label;
}

/**
 * Format row label for display
 */
export function formatRowLabel(label: string): string {
  if (label === '1') return 'Home';
  if (label === '2') return 'Away';
  if (label === 'X') return 'Draw';
  return label;
}
