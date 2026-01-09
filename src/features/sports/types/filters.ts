// Strict filter types for sports feature
export interface GameFilter {
  sportSlug?: string;
  leagueSlug?: string;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface SportsFilter {
  isLive?: boolean;
  sportSlug?: string;
  category?: 'mainstream' | 'niche' | 'esports' | 'other';
}

export interface SearchFilter {
  query: string;
  sportSlug?: string;
  leagueSlug?: string;
  isLive?: boolean;
}