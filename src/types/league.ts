export interface LeagueProfile {
  id: string;
  name: string;
  slug: string;
  country_name: string;
  country_slug?: string;
  sport_slug?: string;
  logo_url: string;
  season: string;
  stream_synced_at?: string;
}

// Re-export TeamStanding from team types
export type { TeamStanding } from './team';

// Fixture types
export type MatchState = 
  | "To be announced"
  | "Not started" 
  | "First half"
  | "Half time"
  | "Second half"
  | "Extra time"
  | "Break time"
  | "Penalties"
  | "Suspended"
  | "Interrupted"
  | "Finished"
  | "Finished after penalties"
  | "Finished after extra time"
  | "Postponed"
  | "Cancelled"
  | "Abandoned"
  | "Awarded"
  | "In progress"
  | "Unknown";

export interface Country {
  code: string;
  name: string;
  logo: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface League {
  id: number;
  season: number;
  name: string;
  logo: string;
}

export interface State {
  description: MatchState;
}

export interface Score {
  current: string;
  penalties: string;
}

export interface Fixture {
  id: number;
  round: string;
  date: string;
  country: Country;
  awayTeam: Team;
  homeTeam: Team;
  league: League;
  state: State;
  clock?: number;
  score: Score;
}