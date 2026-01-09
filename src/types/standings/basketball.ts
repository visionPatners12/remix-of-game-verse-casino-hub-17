export interface BasketballStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    slug?: string;
    logo: string;
  };
  wins: number;
  losses: number;
  gamesPlayed: number;
  scoredPoints: number;
  receivedPoints: number;
  win_pct?: number | string;
  games_behind?: number;
  streak?: string;
  conference?: string;
  division?: string;
  stage?: string;
  group_name?: string;
  description?: string;
  raw_stats?: {
    statistics?: Array<{ displayName: string; value: string | number }>;
  };
}

export interface BasketballStandingsGroup {
  name: string;
  standings: BasketballStanding[];
  description?: string;
}
