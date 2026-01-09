// Bet post types

export interface BetSelection {
  market: string;
  outcome: string;
  odds: number;
  conditionId: string;
  outcomeId: string;
}

export interface BetMatch {
  id: string;
  date: string;
  homeId: string;
  homeName: string;
  awayId: string;
  awayName: string;
  league: string;
  leagueId: string;
}

export interface BetUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface BetPost {
  verb: 'bet';
  object: string; // matchId
  time: string;
  selectionId: string;
  selection: BetSelection;
  analysis: string;
  betAmount: number;
  currency: 'USDT';
  hashtags: string[];
  match: BetMatch;
  user: BetUser;
}

export interface StreamBetPost {
  id: string;
  actor: {
    id: string;
    data: BetUser;
  };
  verb: 'bet';
  object: string;
  time: string;
  selections: BetSelection[];
  bet_type?: 'simple' | 'combiné';
  analysis?: string;
  betAmount?: number;
  currency?: string;
  hashtags?: string[];
  totalOdds?: number;
  potentialWin?: number;
  reaction_counts?: {
    like?: number;
    comment?: number;
  };
  own_reactions?: {
    like?: boolean;
  };
}