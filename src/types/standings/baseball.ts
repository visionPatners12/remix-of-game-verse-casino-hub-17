export interface BaseballStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    logo: string;
    slug?: string;
  };
  // Statistiques principales
  wins: number;
  losses: number;
  gamesPlayed: number;
  winPct: number;
  gamesBehind: number | string;
  streak: string;
  
  // Statistiques offensives/défensives
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  
  // Records
  homeRecord: string;
  awayRecord: string;
  totalRecord: string;
  lastTen: string;
  
  // Division/League
  intraDivision?: string;
  intraLeague?: string;
  
  // Playoffs info
  clinch?: string;
  seed?: number;
  playoffPct?: string;
  
  // Grouping
  group_name?: string;
  stage?: string;
  description?: string;
}

export interface BaseballStandingsGroup {
  name: string;
  divisions?: {
    name: string;
    standings: BaseballStanding[];
  }[];
  standings?: BaseballStanding[];
}
