export interface VolleyballStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    slug?: string;
    logo: string;
  };
  gamesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  setsDifference: number;
  points: number;
  stage?: string;
  group_name?: string;
}
