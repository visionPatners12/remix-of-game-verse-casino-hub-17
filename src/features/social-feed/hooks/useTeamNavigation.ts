import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildTeamUrl, buildSimpleTeamUrl } from '@/utils/seoUrls';

/**
 * Shared hook for team navigation across all post types
 * Uses SEO-friendly URLs: /team/:sport/:slug/:uuid
 */
export function useTeamNavigation() {
  const navigate = useNavigate();

  // Navigation with full team data (preferred - SEO-friendly)
  const navigateToTeam = useCallback((team: {
    id: string;
    slug?: string | null;
    name?: string | null;
    sport_slug?: string | null;
    sport_name?: string | null;
  }) => {
    if (!team.id) return;
    const url = buildTeamUrl(team);
    navigate(url);
  }, [navigate]);

  // Navigation by UUID only (fallback)
  const navigateToTeamById = useCallback((teamId: string) => {
    if (!teamId) return;
    navigate(buildSimpleTeamUrl(teamId));
  }, [navigate]);

  const createTeamClickHandler = useCallback((team: {
    id: string;
    slug?: string | null;
    name?: string | null;
    sport_slug?: string | null;
    sport_name?: string | null;
  }) => {
    return () => navigateToTeam(team);
  }, [navigateToTeam]);

  const createTeamClickHandlerById = useCallback((teamId: string) => {
    return () => navigateToTeamById(teamId);
  }, [navigateToTeamById]);

  return {
    navigateToTeam,
    navigateToTeamById,
    createTeamClickHandler,
    createTeamClickHandlerById
  };
}
