import type { HighlightMatchScore } from '../utils/parseScore';

/**
 * Type pour la réponse de la RPC get_highlights
 * Combine tous les champs de la table highlights + enrichissements
 */
export interface GetHighlightsResponse {
  // Champs de la table highlights
  id: string;
  highlightly_id: number;
  title: string | null;
  description: string | null;
  type: string;
  video_url: string | null;
  embed_url: string | null;
  image_url: string | null;
  duration_seconds: number | null;
  source: string | null;
  sport_id: string;
  league_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  created_at: string;
  updated_at: string;
  match_date: string; // timestamptz from RPC
  
  // Enrichissements calculés par la RPC
  relevance_score: number;
  match_reason: string;
  league: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
  home_team: {
    id: string;
    name: string;
    logo: string | null;
    abbreviation: string | null;
  } | null;
  away_team: {
    id: string;
    name: string;
    logo: string | null;
    abbreviation: string | null;
  } | null;
  match: {
    id: string;
    status?: string | null;
    stage?: string | null;
    round?: string | null;
    states?: {
      score?: {
        current?: string | null;
      } | null;
    } | null;
  } | null;
}
