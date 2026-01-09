export interface RugbyStanding {
  id: string;
  position: number;
  team: {
    id: string;
    name: string;
    logo: string;
    slug?: string;
  };
  gamesPlayed: number;
  wins: number;
  draws: number;
  loses: number;
  scoredPoints: number;
  receivedPoints: number;
  pointsDifference: number;
  points: number;
  stage?: string;
  description?: string;
}

export interface RugbyStandingsGroup {
  stage: string;
  standings: RugbyStanding[];
}
