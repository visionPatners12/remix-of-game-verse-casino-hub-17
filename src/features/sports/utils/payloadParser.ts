/**
 * Utility functions to parse scores from sports_data.match.states column
 */

import type { MatchStates } from '@/features/sports/types/supabase';

export interface ParsedScore {
  home: number;
  away: number;
  breakdown?: {
    label: string;
    home: number;
    away: number;
  }[];
}

/**
 * Helper to parse "X - Y" string format to [home, away] numbers
 */
function parseScoreString(str: string | undefined | null): [number, number] | null {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(' - ');
  if (parts.length !== 2) return null;
  return [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0];
}

/**
 * Parse score from sports_data.match.states column
 * Adapts to each sport's specific format
 */
export function parseStatesScore(states: MatchStates | null | undefined, sportSlug: string): ParsedScore | undefined {
  if (!states) return undefined;
  
  const score = states.score;
  
  // Rugby: score direct en string ("33 - 20")
  const isRugby = sportSlug === 'rugby' || sportSlug === 'rugby-union' || sportSlug === 'rugby-league';
  if (isRugby && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      return { home: parsed[0], away: parsed[1] };
    }
  }
  
  // Cricket: format spécial avec runs/wickets dans states.teams
  if (sportSlug === 'cricket' && states.teams) {
    const homeScore = states.teams.home?.score; // "145/4"
    const awayScore = states.teams.away?.score;
    const homeRuns = parseInt(homeScore?.split('/')[0], 10) || 0;
    const awayRuns = parseInt(awayScore?.split('/')[0], 10) || 0;
    return { home: homeRuns, away: awayRuns };
  }
  
  // Hockey (NHL/NCAA/KHL): score est un OBJET avec current et firstPeriod/secondPeriod/thirdPeriod
  if ((sportSlug === 'hockey' || sportSlug === 'ice-hockey') && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      // Period scores are strings like "1 - 0"
      ['firstPeriod', 'secondPeriod', 'thirdPeriod'].forEach((key, idx) => {
        const val = score[key];
        if (typeof val === 'string') {
          const parsed = parseScoreString(val);
          if (parsed) {
            breakdown.push({ label: `P${idx + 1}`, home: parsed[0], away: parsed[1] });
          }
        }
      });
      
      // Overtime
      const otParsed = parseScoreString(score.overtimePeriod) || parseScoreString(score.overTime);
      if (otParsed) {
        breakdown.push({ label: 'OT', home: otParsed[0], away: otParsed[1] });
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Hockey fallback: score en string + scoreDetails (legacy format)
  if ((sportSlug === 'hockey' || sportSlug === 'ice-hockey') && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      const [home, away] = parsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const details = states.scoreDetails;
      if (details) {
        ['firstPeriod', 'secondPeriod', 'thirdPeriod'].forEach((key, idx) => {
          const periodParsed = parseScoreString(details[key]);
          if (periodParsed) {
            breakdown.push({ label: `P${idx + 1}`, home: periodParsed[0], away: periodParsed[1] });
          }
        });
        const otParsed = parseScoreString(details.overtimePeriod);
        if (otParsed) {
          breakdown.push({ label: 'OT', home: otParsed[0], away: otParsed[1] });
        }
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Volleyball: score est un OBJET avec current et sets
  if (sportSlug === 'volleyball' && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      ['firstSet', 'secondSet', 'thirdSet', 'fourthSet', 'fifthSet'].forEach((key, idx) => {
        const val = score[key];
        if (typeof val === 'string') {
          const parsed = parseScoreString(val);
          if (parsed) {
            breakdown.push({ label: `S${idx + 1}`, home: parsed[0], away: parsed[1] });
          }
        }
      });
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Volleyball fallback: score en string + scoreDetails
  if (sportSlug === 'volleyball' && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      const [home, away] = parsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const details = states.scoreDetails;
      if (details) {
        ['firstSet', 'secondSet', 'thirdSet', 'fourthSet', 'fifthSet'].forEach((key, idx) => {
          const setParsed = parseScoreString(details[key]);
          if (setParsed) {
            breakdown.push({ label: `S${idx + 1}`, home: setParsed[0], away: setParsed[1] });
          }
        });
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }

  // American Football (NFL/NCAA): score est un OBJET avec current et quarters
  if (sportSlug === 'american-football' && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      ['firstPeriod', 'secondPeriod', 'thirdPeriod', 'fourthPeriod'].forEach((key, idx) => {
        const val = score[key];
        if (typeof val === 'string') {
          const parsed = parseScoreString(val);
          if (parsed) {
            breakdown.push({ label: `Q${idx + 1}`, home: parsed[0], away: parsed[1] });
          }
        }
      });
      
      // Overtime
      const otParsed = parseScoreString(score.firstOvertimePeriod) || parseScoreString(score.overTime);
      if (otParsed) {
        breakdown.push({ label: 'OT', home: otParsed[0], away: otParsed[1] });
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // American Football fallback: score en string + scoreDetails
  if (sportSlug === 'american-football' && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      const [home, away] = parsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const details = states.scoreDetails;
      if (details) {
        ['firstPeriod', 'secondPeriod', 'thirdPeriod', 'fourthPeriod'].forEach((key, idx) => {
          const periodParsed = parseScoreString(details[key]);
          if (periodParsed) {
            breakdown.push({ label: `Q${idx + 1}`, home: periodParsed[0], away: periodParsed[1] });
          }
        });
        const otParsed = parseScoreString(details.firstOvertimePeriod);
        if (otParsed) {
          breakdown.push({ label: 'OT', home: otParsed[0], away: otParsed[1] });
        }
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }

  // Basketball (NBA/NCAA): score est un OBJET avec current et q1-q4
  if (sportSlug === 'basketball' && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      // Quarters are strings like "22 - 13"
      ['q1', 'q2', 'q3', 'q4'].forEach((key, idx) => {
        const val = score[key];
        if (typeof val === 'string') {
          const parsed = parseScoreString(val);
          if (parsed) {
            breakdown.push({ label: `Q${idx + 1}`, home: parsed[0], away: parsed[1] });
          }
        }
      });
      
      // Overtime
      const otParsed = parseScoreString(score.overTime);
      if (otParsed) {
        breakdown.push({ label: 'OT', home: otParsed[0], away: otParsed[1] });
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Basketball fallback: score en string + scoreDetails (quarters as objects)
  if (sportSlug === 'basketball' && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      const [home, away] = parsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const details = states.scoreDetails as Record<string, { home?: number; away?: number } | string> | undefined;
      if (details) {
        ['q1', 'q2', 'q3', 'q4'].forEach((key, idx) => {
          const quarter = details[key];
          if (quarter && typeof quarter === 'object') {
            breakdown.push({ 
              label: `Q${idx + 1}`, 
              home: quarter.home || 0, 
              away: quarter.away || 0 
            });
          } else if (typeof quarter === 'string') {
            const qParsed = parseScoreString(quarter);
            if (qParsed) {
              breakdown.push({ label: `Q${idx + 1}`, home: qParsed[0], away: qParsed[1] });
            }
          }
        });
        const ot = details.overTime;
        if (ot && typeof ot === 'object') {
          breakdown.push({ label: 'OT', home: ot.home || 0, away: ot.away || 0 });
        } else if (typeof ot === 'string') {
          const otParsed = parseScoreString(ot);
          if (otParsed) {
            breakdown.push({ label: 'OT', home: otParsed[0], away: otParsed[1] });
          }
        }
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }

  // Football (soccer): score est un OBJET avec current et halves
  if (sportSlug === 'football' && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const h1Parsed = parseScoreString(score.firstHalf);
      if (h1Parsed) breakdown.push({ label: 'H1', home: h1Parsed[0], away: h1Parsed[1] });
      
      const h2Parsed = parseScoreString(score.secondHalf);
      if (h2Parsed) breakdown.push({ label: 'H2', home: h2Parsed[0], away: h2Parsed[1] });
      
      const etParsed = parseScoreString(score.extraTime);
      if (etParsed) breakdown.push({ label: 'ET', home: etParsed[0], away: etParsed[1] });
      
      const penParsed = parseScoreString(score.penalties);
      if (penParsed) breakdown.push({ label: 'PEN', home: penParsed[0], away: penParsed[1] });
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Football (soccer) fallback: score en string + scoreDetails
  if (sportSlug === 'football' && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      const [home, away] = parsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const details = states.scoreDetails;
      if (details) {
        const h1Parsed = parseScoreString(details.firstHalf);
        if (h1Parsed) breakdown.push({ label: 'H1', home: h1Parsed[0], away: h1Parsed[1] });
        
        const h2Parsed = parseScoreString(details.secondHalf);
        if (h2Parsed) breakdown.push({ label: 'H2', home: h2Parsed[0], away: h2Parsed[1] });
        
        const etParsed = parseScoreString(details.extraTime);
        if (etParsed) breakdown.push({ label: 'ET', home: etParsed[0], away: etParsed[1] });
        
        const penParsed = parseScoreString(details.penalties);
        if (penParsed) breakdown.push({ label: 'PEN', home: penParsed[0], away: penParsed[1] });
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }

  // Baseball (MLB/NCAA): score est un OBJET avec current et innings
  if (sportSlug === 'baseball' && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      // Innings are in score.home.innings and score.away.innings
      const homeInnings = score.home?.innings;
      const awayInnings = score.away?.innings;
      if (Array.isArray(homeInnings) && Array.isArray(awayInnings)) {
        const maxInnings = Math.max(homeInnings.length, awayInnings.length);
        for (let i = 0; i < maxInnings; i++) {
          breakdown.push({ 
            label: `${i + 1}`, 
            home: homeInnings[i] || 0, 
            away: awayInnings[i] || 0 
          });
        }
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Baseball fallback: score en string + scoreDetails
  if (sportSlug === 'baseball' && typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      const [home, away] = parsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const homeInnings = states.scoreDetails?.home?.innings;
      const awayInnings = states.scoreDetails?.away?.innings;
      if (Array.isArray(homeInnings) && Array.isArray(awayInnings)) {
        const maxInnings = Math.max(homeInnings.length, awayInnings.length);
        for (let i = 0; i < maxInnings; i++) {
          breakdown.push({ label: `${i + 1}`, home: homeInnings[i] || 0, away: awayInnings[i] || 0 });
        }
      }
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Handball: score est un OBJET avec current et halves
  if (sportSlug === 'handball' && typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      const [home, away] = currentParsed;
      const breakdown: { label: string; home: number; away: number }[] = [];
      
      const h1Parsed = parseScoreString(score.firstHalf);
      if (h1Parsed) breakdown.push({ label: 'H1', home: h1Parsed[0], away: h1Parsed[1] });
      
      const h2Parsed = parseScoreString(score.secondHalf);
      if (h2Parsed) breakdown.push({ label: 'H2', home: h2Parsed[0], away: h2Parsed[1] });
      
      return { home, away, breakdown: breakdown.length > 0 ? breakdown : undefined };
    }
  }
  
  // Generic fallback: score.current for any other sport with object score
  if (typeof score === 'object' && score?.current) {
    const currentParsed = parseScoreString(score.current);
    if (currentParsed) {
      return { home: currentParsed[0], away: currentParsed[1] };
    }
  }
  
  // Last resort: score as string
  if (typeof score === 'string') {
    const parsed = parseScoreString(score);
    if (parsed) {
      return { home: parsed[0], away: parsed[1] };
    }
  }
  
  return undefined;
}
