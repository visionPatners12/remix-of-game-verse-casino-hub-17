export interface NFLStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    slug?: string;
    logo: string;
    abbreviation?: string;
  };
  wins: number;
  losses: number;
  ties?: number;
  win_pct: number;
  games_behind?: string | null;
  differential: string;
  streak?: string;
  conference?: string;
  division?: string;
  stage?: string;
  overall_record?: string;
  home_record?: string;
  road_record?: string;
  division_record?: string;
  playoff_seed?: number;
}

export interface NFLStandingsGroup {
  conference: string;
  divisions: {
    name: string;
    standings: NFLStanding[];
  }[];
}
