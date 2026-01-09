export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  x: number; // Position on field (0-100)
  y: number; // Position on field (0-100)
}

export interface TeamProfile {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  sport_slug?: string;
  sport_name?: string;
  league: {
    id: string;
    name: string;
    slug: string;
    country_name: string;
  };
  country: string;
  founded_year: number;
  stadium: string;
  coach: string;
  verified: boolean;
  colors: {
    primary: string;
    secondary: string;
  };
  stats: {
    followers: number;
    posts_count: number;
    matches_played: number;
    position: number;
    points: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    form: string[]; // ["W", "D", "L", "W", "W"]
  };
  players?: Player[];
}

export interface TeamFixture {
  id: string;
  round: string;
  date: string;
  opponent: {
    id: string;
    name: string;
    logo_url: string;
  };
  is_home: boolean;
  status: 'upcoming' | 'live' | 'finished' | 'postponed';
  venue: string;
  score?: {
    home: number;
    away: number;
  };
  league: {
    id: string;
    name: string;
    logo_url: string;
    country_name: string;
  };
  state: {
    description: string;
  };
  clock?: number;
  country: {
    code: string;
    name: string;
    logo: string;
  };
}

export interface TeamHighlight {
  id: number;
  type: 'goal' | 'summary' | 'interview' | 'injury' | 'celebration';
  imgUrl: string;
  title: string;
  description: string;
  url: string;
  embedUrl: string;
  channel: string;
  source: string;
  match: {
    id: number;
    round: string;
    date: string;
    country: {
      code: string;
      name: string;
      logo: string;
    };
    awayTeam: {
      id: number;
      name: string;
      logo: string;
    };
    homeTeam: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      season: number;
      name: string;
      logo: string;
    };
    state: {
      description: string;
    };
    clock?: number;
    score: {
      current: string;
      penalties: string;
    };
  };
}

export interface TeamStanding {
  position: number;
  team: {
    id: string;
    name: string;
    logo_url: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string[];
}