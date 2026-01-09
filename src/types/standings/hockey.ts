export interface HockeyStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  gamesPlayed: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  streak: string;
  stage?: string;
  group_name?: string;
  conference?: string;
  division?: string;
  description?: string;
}
