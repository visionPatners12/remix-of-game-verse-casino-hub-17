import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { sportsDataClient } from '@/integrations/supabase/client';
import { buildMatchUrl, buildSimpleMatchUrl } from '@/utils/seoUrls';

/**
 * Hook for navigating to match details page
 * Uses SEO-friendly URLs: /match/:sport/:league/:slug/:uuid
 */
export function useMatchNavigation() {
  const navigate = useNavigate();

  /**
   * Navigate with full match data (SEO-friendly)
   */
  const navigateToMatch = useCallback((match: {
    id: string;
    home_name?: string | null;
    home_slug?: string | null;
    away_name?: string | null;
    away_slug?: string | null;
    league_slug?: string | null;
    league_name?: string | null;
    sport_slug?: string | null;
    sport_name?: string | null;
  }) => {
    if (!match.id) return;
    const url = buildMatchUrl(match);
    navigate(url);
  }, [navigate]);

  /**
   * Navigate by UUID only (fallback)
   */
  const navigateToMatchById = useCallback((matchId: string) => {
    if (!matchId) return;
    navigate(buildSimpleMatchUrl(matchId));
  }, [navigate]);

  /**
   * Navigate from Azuro game ID (converts to UUID via stg_azuro_games lookup)
   * Falls back to simple URL pattern
   */
  const navigateFromAzuroGameId = useCallback(async (azuroGameId: string) => {
    if (!azuroGameId) return;
    
    const { data } = await sportsDataClient
      .from('stg_azuro_games')
      .select('id')
      .eq('azuro_game_id', azuroGameId)
      .maybeSingle();

    if (data?.id) {
      navigate(buildSimpleMatchUrl(data.id));
    }
  }, [navigate]);

  return { 
    navigateToMatch, 
    navigateToMatchById,
    navigateFromAzuroGameId,
    // Legacy alias for backward compatibility
    navigateToMatchByAzuroId: navigateFromAzuroGameId
  };
}
