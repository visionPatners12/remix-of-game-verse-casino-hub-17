export interface FootballStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    logo: string;
    slug?: string;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form?: string; // "WWLDD" format
  status?: string; // "up", "down", etc.
  description?: string;
  stage?: string; // "Group A", "Playoffs", etc.
  
  // Home/Away stats
  home_played?: number;
  home_wins?: number;
  home_draws?: number;
  home_losses?: number;
  away_played?: number;
  away_wins?: number;
  away_draws?: number;
  away_losses?: number;
  
  // Zone information
  zone?: QualificationZone;
}

export interface QualificationZone {
  type: 'champions-league' | 'europa-league' | 'conference-league' | 'relegation' | 'promotion' | 'playoff' | 'safe';
  label: string;
  color: string;
  description?: string;
}

export interface FootballStandingsConfig {
  showZones: boolean;
  showForm: boolean;
  showHomeAway: boolean;
  zones: QualificationZone[];
}

// Raw data structure from league_team_table
export interface LeagueTeamTableRow {
  id: string;
  team_id: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
  form?: string;
  status?: string;
  description?: string;
  home_played?: number;
  home_wins?: number;
  home_draws?: number;
  home_losses?: number;
  away_played?: number;
  away_wins?: number;
  away_draws?: number;
  away_losses?: number;
  extra?: {
    team_name?: string;
    team_logo?: string;
    team_slug?: string;
  };
}