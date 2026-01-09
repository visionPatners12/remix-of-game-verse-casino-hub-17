export interface HandballStanding {
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
  draws: number;
  loses: number;
  scoredPoints: number;
  receivedPoints: number;
  pointsDifference: number;
  points: number;
  stage?: string;
  group_name?: string;
  description?: string;
}

export interface HandballStandingsGroup {
  name: string;
  standings: HandballStanding[];
  description?: string;
}
