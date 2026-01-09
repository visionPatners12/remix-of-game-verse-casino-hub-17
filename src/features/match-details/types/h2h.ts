/**
 * Head-to-Head match data types
 */

export interface H2HMatch {
  id: string;
  date: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  homeScore: number;
  awayScore: number;
  competition?: {
    name: string;
    logo?: string;
  };
  // Cricket-specific data
  cricketData?: {
    format: string; // "T20", "ODI", "Test"
    homeScoreStr: string; // "137/8" (runs/wickets)
    awayScoreStr: string; // "139/4"
    report?: string; // "Won by 6 wickets"
    overs?: { home?: string; away?: string };
  };
  // Basketball-specific data
  basketballData?: {
    q1?: { home: number; away: number };
    q2?: { home: number; away: number };
    q3?: { home: number; away: number };
    q4?: { home: number; away: number };
    overTime?: { home: number; away: number };
  };
  // Volleyball-specific data
  volleyballData?: {
    set1?: { home: number; away: number };
    set2?: { home: number; away: number };
    set3?: { home: number; away: number };
    set4?: { home: number; away: number };
    set5?: { home: number; away: number };
  };
  // Hockey-specific data (NHL format with periods)
  hockeyData?: {
    firstPeriod?: { home: number; away: number };
    secondPeriod?: { home: number; away: number };
    thirdPeriod?: { home: number; away: number };
    overtimePeriod?: { home: number; away: number };
  };
}

export interface H2HSummary {
  homeWins: number;
  draws: number;
  awayWins: number;
  totalMatches: number;
}

export interface H2HData {
  summary: H2HSummary;
  matches: H2HMatch[];
}
