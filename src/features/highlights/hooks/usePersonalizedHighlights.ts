import { useQuery } from '@tanstack/react-query';
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Highlight } from '../types';

export interface PersonalizedHighlight extends Highlight {
  relevanceScore: number;
  matchReason: 'favorite_team' | 'favorite_league' | 'favorite_sport' | 'recent';
}

interface UserPreference {
  id: string;
  entity_type: 'sport' | 'league' | 'team' | 'player';
  sport_id: string | null;
  league_id: string | null;
  team_id: string | null;
  player_id: string | null;  // UUID
  position: number;
}

/**
 * Hook pour récupérer les highlights personnalisés selon les préférences utilisateur
 * Calcule un score de pertinence basé sur : équipe favorite (+15), ligue (+8), sport (+10), récence (+5)
 */
export function usePersonalizedHighlights(limit: number = 12) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-highlights', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) {
        // Fallback: retourner les highlights récents si pas connecté
        const { data } = await sportsDataClient
          .from('highlights')
          .select(`
            *,
            league:league_id(id, name, logo, slug),
            home_team:home_team_id(id, name, logo, abbreviation),
            away_team:away_team_id(id, name, logo, abbreviation)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        return (data || []).map(h => ({
          ...h,
          relevanceScore: 0,
          matchReason: 'recent' as const
        })) as PersonalizedHighlight[];
      }

      // 1. Récupérer les préférences utilisateur
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (prefError) throw prefError;

      // 2. Fetch highlights récents (on en prend plus pour avoir du choix)
      const { data: highlights, error: highlightsError } = await sportsDataClient
        .from('highlights')
        .select(`
          *,
          league:league_id(id, name, logo, slug),
          home_team:home_team_id(id, name, logo, abbreviation),
          away_team:away_team_id(id, name, logo, abbreviation)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (highlightsError) throw highlightsError;
      if (!highlights || highlights.length === 0) return [];

      // 3. Calculer le score pour chaque highlight
      const scored = highlights.map(highlight => 
        calculateRelevanceScore(highlight as Highlight, preferences || [])
      );

      // 4. Trier par score décroissant et prendre les N premiers
      return scored
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Calcule le score de pertinence d'un highlight selon les préférences utilisateur
 * Score = (équipe_favorite × 15) + (ligue_favorite × 8) + (sport_favori × 10) + (récent × 5)
 */
function calculateRelevanceScore(
  highlight: Highlight,
  preferences: UserPreference[]
): PersonalizedHighlight {
  let score = 0;
  let matchReason: PersonalizedHighlight['matchReason'] = 'recent';

  // Extraire les préférences par type
  const teamPrefs = preferences.filter(p => p.entity_type === 'team');
  const leaguePrefs = preferences.filter(p => p.entity_type === 'league');
  const sportPrefs = preferences.filter(p => p.entity_type === 'sport');

  // 1. ÉQUIPE FAVORITE (priorité maximale : +15 points)
  const isHomeTeamFavorite = teamPrefs.some(p => p.team_id === highlight.home_team_id);
  const isAwayTeamFavorite = teamPrefs.some(p => p.team_id === highlight.away_team_id);
  
  if (isHomeTeamFavorite || isAwayTeamFavorite) {
    score += 15;
    matchReason = 'favorite_team';
  }

  // 2. LIGUE FAVORITE (+8 points)
  const isLeagueFavorite = leaguePrefs.some(p => p.league_id === highlight.league_id);
  
  if (isLeagueFavorite) {
    score += 8;
    if (matchReason === 'recent') matchReason = 'favorite_league';
  }

  // 3. SPORT FAVORI (+10 points)
  const isSportFavorite = sportPrefs.some(p => p.sport_id === highlight.sport_id);
  
  if (isSportFavorite) {
    score += 10;
    if (matchReason === 'recent') matchReason = 'favorite_sport';
  }

  // 4. BONUS RÉCENCE (derniers 7 jours : +0 à +5 points)
  const daysSinceCreation = (Date.now() - new Date(highlight.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 7) {
    score += Math.max(0, 5 - daysSinceCreation);
  }

  return {
    ...highlight,
    relevanceScore: score,
    matchReason
  };
}
