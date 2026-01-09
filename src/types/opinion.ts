export interface StreamOpinion {
  id: string;
  verb: 'opinion';
  object: string; // matchId
  content: string;
  match: {
    id: string;
    teamA: string;
    teamB: string;
    leagueName: string;
    date: string;
  };
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  time: string;
  reaction_counts?: {
    like?: number;
    upvote?: number;
    downvote?: number;
  };
  own_reactions?: {
    like?: any[];
    upvote?: any[];
    downvote?: any[];
  };
  latest_reactions?: {
    like?: any[];
    upvote?: any[];
    downvote?: any[];
  };
}

export interface CreateOpinionData {
  matchId: string;
  content: string;
  match: {
    id: string;
    teamA: string;
    teamB: string;
    leagueName: string;
    date: string;
  };
}