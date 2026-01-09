export interface CricketStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    logo: string;
    slug?: string;
  };
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  runsFor: string; // Format: "runs/wickets"
  runsAgainst: string; // Format: "runs/wickets"
  netRunRate?: number | null;
  form?: string;
  stage?: string;
  group_name?: string;
}

export interface CricketStandingsConfig {
  showForm: boolean;
  showNetRunRate: boolean;
}

// Raw data structure from standings table
export interface CricketStandingRow {
  id: string;
  team_id: string;
  rank: number;
  stage?: string;
  group_name?: string;
  stats_total: {
    matchesPlayed: number;
    wins: number;
    loses: number;
    ties: number;
    points: number;
    pointsFor: string; // "runs/wickets"
    pointsAgainst: string; // "runs/wickets"
    netRunRate?: number | null;
  };
}
