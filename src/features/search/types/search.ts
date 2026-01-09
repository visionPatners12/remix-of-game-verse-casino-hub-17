/**
 * Core search types and interfaces
 */

export interface SearchUser {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  similarity_score: number;
}

export interface SearchLeague {
  league_id: string;
  league_name: string;
  league_slug: string;
  league_logo: string | null;
  country_id: string | null;
  country_name: string | null;
  country_slug: string | null;
  sport_id: string;
  sport_name: string;
  sport_slug: string;
  sport_icon: string | null;
  rank: number;
}

export interface SearchTeam {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  country_id: string | null;
  country_name: string | null;
  sport_id: string;
  sport_name: string;
  sport_slug: string;
  sport_icon: string | null;
  rank: number;
}

export interface SearchPlayer {
  id: string;
  name: string;
  logo: string | null;
  sport_id?: string;
  sport_name: string;
  sport_slug?: string;
  sport_icon: string | null;
  team_name: string | null;
  rank?: number;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
  type: 'user' | 'text' | 'hashtag' | 'news' | 'league' | 'team' | 'player';
  userData?: SearchUser;
  leagueData?: SearchLeague;
  teamData?: SearchTeam;
  playerData?: SearchPlayer;
  metadata?: Record<string, any>;
}

export interface TrendingTopic {
  text: string;
  posts: string;
  category?: 'sports' | 'crypto' | 'betting' | 'general';
  growth?: number;
}

export interface SuggestedUser {
  id: number | string;
  username: string;
  name: string;
  avatar: string;
  followers: number;
  verified: boolean;
  bio?: string;
  reason?: 'follows_you' | 'shared_interests' | 'shared_favorites';
}

export interface SearchOptions {
  minLength?: number;
  debounceMs?: number;
  maxResults?: number;
  type?: 'user' | 'content' | 'all';
}

export interface SearchState<T = any> {
  query: string;
  results: T[];
  isLoading: boolean;
  error: string | null;
  hasMore?: boolean;
  page?: number;
}

export interface GlobalSearchResults {
  users: SearchUser[];
  leagues: SearchLeague[];
  teams: SearchTeam[];
  players: SearchPlayer[];
  isLoading: boolean;
  error: string | null;
}