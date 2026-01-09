import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { buildLeagueUrl, buildSimpleLeagueUrl } from '@/utils/seoUrls';

/**
 * Hook for handling navigation to league pages
 * Uses SEO-friendly URLs: /league/:country/:slug/:uuid
 */
export function useLeagueNavigation() {
  const navigate = useNavigate();

  /**
   * Navigate to a league page with full data (SEO-friendly)
   */
  const navigateToLeague = useCallback(
    (league: {
      id: string;
      slug?: string | null;
      name?: string | null;
      country_slug?: string | null;
      country_name?: string | null;
    }) => {
      if (!league.id) return;
      const url = buildLeagueUrl(league);
      navigate(url);
    },
    [navigate]
  );

  /**
   * Navigate to a league page by UUID only (fallback)
   */
  const navigateToLeagueById = useCallback(
    (leagueId: string) => {
      if (!leagueId) return;
      navigate(buildSimpleLeagueUrl(leagueId));
    },
    [navigate]
  );

  /**
   * Create a click handler that navigates to a league
   */
  const createLeagueClickHandler = useCallback(
    (league: {
      id: string;
      slug?: string | null;
      name?: string | null;
      country_slug?: string | null;
      country_name?: string | null;
    }) => {
      return () => navigateToLeague(league);
    },
    [navigateToLeague]
  );

  const createLeagueClickHandlerById = useCallback(
    (leagueId: string) => {
      return () => navigateToLeagueById(leagueId);
    },
    [navigateToLeagueById]
  );

  return {
    navigateToLeague,
    navigateToLeagueById,
    createLeagueClickHandler,
    createLeagueClickHandlerById,
  };
}
