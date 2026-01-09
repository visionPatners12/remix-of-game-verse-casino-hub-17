/**
 * Unified score parsing utility for highlights
 * Handles all known score formats from RPC and transformers
 */

/**
 * Strongly typed score structure for highlight matches
 * Covers all known formats from Supabase RPC and API responses
 */
export type HighlightMatchScoreObject = {
  // Direct current format from RPC: states.score = { current: "3 - 0" }
  current?: string;
  // Nested RPC format: states.score.score.current = "3 - 0"
  score?: {
    current?: string;
    home?: number;
    away?: number;
  };
  // Direct format
  home?: number | { total?: number };
  away?: number | { total?: number };
  // Full time format
  fullTime?: {
    home: number;
    away: number;
  };
};

// Score can be a direct string "15 - 17" or an object with various formats
export type HighlightMatchScore = string | HighlightMatchScoreObject;

export interface ParsedScore {
  home: string | null;
  away: string | null;
}

/**
 * Parse score from various highlight match score formats
 * Handles: Direct string, RPC current string, direct numbers, nested totals, fullTime format
 */
export function parseHighlightScore(score: HighlightMatchScore | null | undefined): ParsedScore {
  const nullResult: ParsedScore = { home: null, away: null };
  
  if (!score) return nullResult;

  try {
    // Format 0: Direct string from RPC - "15 - 17"
    if (typeof score === 'string') {
      const parts = score.split(' - ');
      if (parts.length === 2) {
        return { home: parts[0].trim(), away: parts[1].trim() };
      }
      return nullResult;
    }

    // Format 1: Direct current format from RPC states.score - { current: "3 - 0" }
    if (score.current && typeof score.current === 'string') {
      const parts = score.current.split(' - ');
      if (parts.length === 2) {
        return { home: parts[0].trim(), away: parts[1].trim() };
      }
    }

    // Format 2: Nested RPC format - score.score.current = "3 - 0"
    if (score.score?.current && typeof score.score.current === 'string') {
      const parts = score.score.current.split(' - ');
      if (parts.length === 2) {
        return { home: parts[0].trim(), away: parts[1].trim() };
      }
    }

    // Format 2: Direct numbers - { home: 3, away: 1 }
    if (typeof score.home === 'number' && typeof score.away === 'number') {
      return { home: String(score.home), away: String(score.away) };
    }

    // Format 3: Nested totals - { home: { total: 3 }, away: { total: 1 } }
    if (typeof score.home === 'object' && typeof score.away === 'object') {
      const homeTotal = score.home?.total;
      const awayTotal = score.away?.total;
      if (typeof homeTotal === 'number' && typeof awayTotal === 'number') {
        return { home: String(homeTotal), away: String(awayTotal) };
      }
    }

    // Format 4: fullTime format - { fullTime: { home: 3, away: 1 } }
    if (score.fullTime) {
      return { 
        home: String(score.fullTime.home), 
        away: String(score.fullTime.away) 
      };
    }

    return nullResult;
  } catch {
    return nullResult;
  }
}
