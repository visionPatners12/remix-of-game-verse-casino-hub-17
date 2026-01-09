export interface PlayerPosition {
  main: string;
  abbreviation: string;
  secondary?: string;  // Football: "Centre-Forward, Second Striker"
}

export interface PlayerDraft {
  round: number;
  year: number;
  pick: number;
}

export interface PlayerTeam {
  id: number;
  logo: string;
  name: string;
  league: string;
  displayName: string;
  abbreviation: string;
}

// Football-specific club info
export interface FootballClub {
  current: string;
  contractExpiry?: string;  // "31/12/2028"
  joinedAt?: string;        // "15/07/2023"
  latestContractExtension?: string;
}

// Transfer rumour
export interface TransferRumour {
  club: string;
  rumourDate: string;
  transferProbability: string;
}

// Rumours container
export interface Rumours {
  current: TransferRumour[];
  historical: TransferRumour[];
}

// News article
export interface NewsArticle {
  title: string;
  date: string;
  url: string;
}

// Market value point
export interface MarketValuePoint {
  recordedDate: string;  // "05/06/2025" DD/MM/YYYY
  value: number;
  currency: string;
  club: string;
  age: number;
}

// Transfer record
export interface Transfer {
  transferDate: string;  // "Jul 15, 2023"
  from: string;
  to: string;
  fee: string | null;
  marketValue: string | null;  // "€35.00M"
  season: string;
  type?: string;
}

export interface PlayerProfile {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  height: string;
  jersey: string;
  weight: string;
  isActive: boolean;
  position: PlayerPosition;
  draft: PlayerDraft;
  team: PlayerTeam;
  // Football-specific
  foot?: string;           // "left", "right", "both"
  citizenship?: string;    // "Argentina, Spain"
  club?: FootballClub;
}

export interface Player {
  id: string;  // UUID
  name?: string;  // Short name (e.g., "L. Messi")
  fullName: string;
  logo: string;
  profile: PlayerProfile;
  // Football-specific data
  sportSlug?: string;
  rumours?: Rumours;
  relatedNews?: NewsArticle[];
  marketValue?: MarketValuePoint[];
  transfers?: Transfer[];
}

export interface PlayerStat {
  name: string;
  value: number;
  category: string;
}

export interface PlayerSeasonStats {
  stats: PlayerStat[];
  teams: PlayerTeam[];
  league: string;
  season: number;
  seasonBreakdown: string;
}

// Football-specific stats per competition/season
export interface FootballCompetitionStats {
  club: string;
  type: string;           // "national league", "cup", "international"
  league: string;         // "Eredivisie", "Champions League"
  season: string;         // "2025", "2024/25"
  goals: number;
  assists: number;
  ownGoals: number;
  redCards: number;
  yellowCards: number;
  secondYellowCards: number;
  cleanSheets: number;
  gamesPlayed: number;
  goalsConceded: number;
  minutesPlayed: number;
  substitutedIn: number;
  substitutedOut: number;
  penaltiesScored: number;
}

// Football-specific career stats per club
export interface FootballClubCareerStats {
  club: string;
  goals: number;
  assists: number;
  ownGoals: number;
  redCards: number;
  yellowCards: number;
  secondYellowCards: number;
  cleanSheets: number;
  gamesPlayed: number;
  goalsConceded: number;
  minutesPlayed: number;
  substitutedIn: number;
  substitutedOut: number;
  penaltiesScored: number;
}

export interface PlayerStats {
  id: string;  // UUID
  name?: string;  // Short name (e.g., "L. Messi")
  fullName: string;
  logo: string;
  // NBA/Basketball
  perSeason?: PlayerSeasonStats[];
  // Football
  perCompetition?: FootballCompetitionStats[];
  perClub?: FootballClubCareerStats[];
  // Metadata
  lastFetched?: string;
  source?: 'cache' | 'api';
  cacheAgeHours?: number;
}
