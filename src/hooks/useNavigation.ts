import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { buildTeamUrl, buildLeagueUrl, buildMatchUrl, buildSimpleTeamUrl, buildSimpleLeagueUrl, buildSimpleMatchUrl } from '@/utils/seoUrls';

/**
 * Centralized navigation hook for consistent routing across the app
 * All entity navigation uses SEO-friendly URLs with UUID at the end
 */
export function useNavigation() {
  const navigate = useNavigate();

  return {
    // Teams - SEO-friendly URL: /team/:sport/:slug/:uuid
    toTeam: useCallback((team: { id: string; slug?: string | null; name?: string | null; sport_slug?: string | null; sport_name?: string | null }) => {
      if (!team.id) return;
      const url = buildTeamUrl(team);
      navigate(url);
    }, [navigate]),

    // Teams - simple fallback when only UUID is available
    toTeamById: useCallback((teamId: string) => {
      if (!teamId) return;
      navigate(buildSimpleTeamUrl(teamId));
    }, [navigate]),

    // Leagues - SEO-friendly URL: /league/:country/:slug/:uuid
    toLeague: useCallback((league: { id: string; slug?: string | null; name?: string | null; country_slug?: string | null; country_name?: string | null }) => {
      if (!league.id) return;
      const url = buildLeagueUrl(league);
      navigate(url);
    }, [navigate]),

    // Leagues - simple fallback when only UUID is available
    toLeagueById: useCallback((leagueId: string) => {
      if (!leagueId) return;
      navigate(buildSimpleLeagueUrl(leagueId));
    }, [navigate]),

    // Users - by username (unchanged)
    toUser: useCallback((username: string) => {
      if (!username) return;
      navigate(`/user/${username}`);
    }, [navigate]),

    // Matches - SEO-friendly URL: /match/:sport/:league/:slug/:uuid
    toMatch: useCallback((match: { 
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
    }, [navigate]),

    // Matches - simple fallback when only UUID is available
    toMatchById: useCallback((matchId: string) => {
      if (!matchId) return;
      navigate(buildSimpleMatchUrl(matchId));
    }, [navigate]),

    // Players - by UUID
    toPlayer: useCallback((playerId: string) => {
      if (!playerId) return;
      navigate(`/player/${playerId}`);
    }, [navigate]),

    // Posts - by UUID
    toPost: useCallback((postId: string) => {
      if (!postId) return;
      navigate(`/post/${postId}`);
    }, [navigate]),

    // Generic navigation helpers
    back: useCallback(() => navigate(-1), [navigate]),
    toDashboard: useCallback(() => navigate('/dashboard'), [navigate]),
    toWallet: useCallback(() => navigate('/wallet'), [navigate]),
    toSettings: useCallback(() => navigate('/settings'), [navigate]),
    toFeed: useCallback(() => navigate('/'), [navigate]),
  };
}
