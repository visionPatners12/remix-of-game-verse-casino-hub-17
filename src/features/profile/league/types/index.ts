// League Profile Feature Types
export interface LeagueProfileData {
  id: string;
  name: string;
  slug: string;
  logo: string;
  logo_url: string;
  country_name: string;
  country_slug?: string;
  sport_slug: string;
  sport_name?: string;
  season: string;
  description?: string;
  highlightly_id?: number;
}

export interface LeagueStats {
  totalMatches: number;
  totalTeams: number;
  currentMatchday?: number;
}

export interface FeaturedLeague {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country_name: string;
  sport_slug: string;
  stats?: LeagueStats;
  is_featured: boolean;
}