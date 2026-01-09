import { useState, useEffect } from 'react';
import { TeamProfile, TeamFixture, TeamHighlight, TeamStanding } from '@/types/team';
import { teamService } from '@/services/teamService';

export function useTeam(teamSlug: string) {
  const [team, setTeam] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true);
        setError(null);
        // Use getTeamById since teamSlug is actually a UUID
        const teamData = await teamService.getTeamById(teamSlug);
        setTeam(teamData);
      } catch (err) {
        setError('Error loading team');
      } finally {
        setLoading(false);
      }
    }

    if (teamSlug) {
      fetchTeam();
    }
  }, [teamSlug]);

  return { team, loading, error };
}

export function useTeamFixtures(teamId: string, type: 'upcoming' | 'recent' = 'upcoming') {
  const [fixtures, setFixtures] = useState<TeamFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setLoading(true);
        setError(null);
        const fixturesData = await teamService.getTeamFixtures(teamId, type);
        setFixtures(fixturesData);
      } catch (err) {
        setError('Error loading matches');
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      fetchFixtures();
    }
  }, [teamId, type]);

  return { fixtures, loading, error };
}

export function useTeamHighlights(teamId: string) {
  const [highlights, setHighlights] = useState<TeamHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        setLoading(true);
        setError(null);
        const highlightsData = await teamService.getTeamHighlights(teamId);
        setHighlights(highlightsData);
      } catch (err) {
        setError('Error loading highlights');
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      fetchHighlights();
    }
  }, [teamId]);

  return { highlights, loading, error };
}

export function useTeamStandings(leagueId: string) {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        setError(null);
        const standingsData = await teamService.getLeagueStandings(leagueId);
        setStandings(standingsData);
      } catch (err) {
        setError('Error loading standings');
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);

  return { standings, loading, error };
}