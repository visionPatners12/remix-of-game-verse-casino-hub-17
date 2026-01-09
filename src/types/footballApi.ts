// Types for Football API Sports responses

export interface FootballApiTeam {
  id: number;
  name: string;
  logo: string;
  country: string;
  founded: number;
  national: boolean;
}

export interface FootballApiVenue {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  surface: string;
  image: string;
}

export interface FootballApiSeason {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: {
    fixtures: {
      events: boolean;
      lineups: boolean;
      statistics_fixtures: boolean;
      statistics_players: boolean;
    };
    standings: boolean;
    players: boolean;
    top_scorers: boolean;
    top_assists: boolean;
    top_cards: boolean;
    injuries: boolean;
    predictions: boolean;
    odds: boolean;
  };
}

export interface FootballApiLeague {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: string;
  flag: string;
  season: number;
  seasons?: FootballApiSeason[];
}

export interface FootballApiFixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
  };
}

export interface FootballApiTeamInfo {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface FootballApiGoals {
  home: number | null;
  away: number | null;
}

export interface FootballApiScore {
  halftime: FootballApiGoals;
  fulltime: FootballApiGoals;
  extratime: FootballApiGoals;
  penalty: FootballApiGoals;
}

export interface FootballApiFixtureData {
  fixture: FootballApiFixture;
  league: FootballApiLeague;
  teams: {
    home: FootballApiTeamInfo;
    away: FootballApiTeamInfo;
  };
  goals: FootballApiGoals;
  score: FootballApiScore;
}

export interface FootballApiStanding {
  rank: number;
  team: FootballApiTeamInfo;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface FootballApiPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

export interface FootballApiPlayerStatistics {
  team: FootballApiTeamInfo;
  league: FootballApiLeague;
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    number: number | null;
    position: string;
    rating: string | null;
    captain: boolean;
  };
  substitutes: {
    in: number;
    out: number;
    bench: number;
  };
  shots: {
    total: number | null;
    on: number | null;
  };
  goals: {
    total: number | null;
    conceded: number | null;
    assists: number | null;
    saves: number | null;
  };
  passes: {
    total: number | null;
    key: number | null;
    accuracy: number | null;
  };
  tackles: {
    total: number | null;
    blocks: number | null;
    interceptions: number | null;
  };
  duels: {
    total: number | null;
    won: number | null;
  };
  dribbles: {
    attempts: number | null;
    success: number | null;
    past: number | null;
  };
  fouls: {
    drawn: number | null;
    committed: number | null;
  };
  cards: {
    yellow: number;
    yellowred: number;
    red: number;
  };
  penalty: {
    won: number | null;
    commited: number | null;
    scored: number | null;
    missed: number | null;
    saved: number | null;
  };
}

export interface FootballApiPlayerData {
  player: FootballApiPlayer;
  statistics: FootballApiPlayerStatistics[];
}

export interface FootballApiInjury {
  player: {
    id: number;
    name: string;
    photo: string;
    type: string;
  };
  team: FootballApiTeamInfo;
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
  };
  league: FootballApiLeague;
}

export interface FootballApiTransfer {
  player: {
    id: number;
    name: string;
  };
  update: string;
  transfers: {
    date: string;
    type: string;
    teams: {
      in: FootballApiTeamInfo;
      out: FootballApiTeamInfo;
    };
  }[];
}

export interface FootballApiCoach {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: {
    date: string;
    place: string;
    country: string;
  };
  nationality: string;
  height: string | null;
  weight: string | null;
  photo: string;
  team: FootballApiTeamInfo;
  career: {
    team: FootballApiTeamInfo;
    start: string;
    end: string | null;
  }[];
}

export interface FootballApiTrophy {
  league: string;
  country: string;
  season: string;
  place: string;
}

export interface FootballApiTeamStatistics {
  league: FootballApiLeague;
  team: FootballApiTeamInfo;
  form: string;
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
      minute: Record<string, {
        total: number | null;
        percentage: string | null;
      }>;
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
      minute: Record<string, {
        total: number | null;
        percentage: string | null;
      }>;
    };
  };
  biggest: {
    streak: {
      wins: number;
      draws: number;
      loses: number;
    };
    wins: {
      home: string;
      away: string;
    };
    loses: {
      home: string;
      away: string;
    };
    goals: {
      for: {
        home: number;
        away: number;
      };
      against: {
        home: number;
        away: number;
      };
    };
  };
  clean_sheet: {
    home: number;
    away: number;
    total: number;
  };
  failed_to_score: {
    home: number;
    away: number;
    total: number;
  };
  penalty: {
    scored: {
      total: number;
      percentage: string;
    };
    missed: {
      total: number;
      percentage: string;
    };
    total: number;
  };
  lineups: {
    formation: string;
    played: number;
  }[];
  cards: {
    yellow: Record<string, {
      total: number | null;
      percentage: string | null;
    }>;
    red: Record<string, {
      total: number | null;
      percentage: string | null;
    }>;
  };
}

// Global parameters for all requests
export interface TeamGlobalParams {
  team_id: string;
  season: string;
  league_id?: string;
}

// Response wrapper for Football API
export interface FootballApiResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}