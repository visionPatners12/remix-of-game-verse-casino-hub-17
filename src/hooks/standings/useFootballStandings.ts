import { useState, useEffect } from 'react';
import { sportsDataClient } from '@/integrations/supabase/client';
import { FootballStanding } from '@/types/standings/football';

export function useFootballStandings(leagueId: string) {
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: standingsData, error: standingsError } = await sportsDataClient
        .from('standings')
        .select(`
          *,
          team:team_id (
            id,
            name,
            logo,
            slug
          )
        `)
        .eq('league_id', leagueId)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true });

      if (standingsError) {
        throw standingsError;
      }

      const transformedStandings: FootballStanding[] = (standingsData || []).map((row: any) => {
        const statsTotal = row.stats_total || {};
        
        // Détecter le format : nested (total exists) ou plat
        const isNestedFormat = !!statsTotal.total;
        
        if (isNestedFormat) {
          // Format nested (UEFA Champions League, etc.)
          const totalStats = statsTotal.total || {};
          const homeStats = statsTotal.home || {};
          const awayStats = statsTotal.away || {};
          
          return {
            id: row.id,
            position: row.rank,
            team: {
              id: row.team.id,
              name: row.team.name,
              logo: row.team.logo || '/placeholder.svg',
              slug: row.team.slug
            },
            played: totalStats.games || 0,
            wins: totalStats.wins || 0,
            draws: totalStats.draws || 0,
            losses: totalStats.loses || 0,
            goals_for: totalStats.scoredGoals || 0,
            goals_against: totalStats.receivedGoals || 0,
            goal_difference: (totalStats.scoredGoals || 0) - (totalStats.receivedGoals || 0),
            points: statsTotal.points || 0,
            home_played: homeStats.games,
            home_wins: homeStats.wins,
            home_draws: homeStats.draws,
            home_losses: homeStats.loses,
            away_played: awayStats.games,
            away_wins: awayStats.wins,
            away_draws: awayStats.draws,
            away_losses: awayStats.loses,
            form: row.form,
            status: row.status,
            description: row.description,
            stage: row.group_name || undefined,
          };
        }
        
        // Format plat (Handball, etc.) avec gestion de la faute "scoredGaols"
        const goalsFor = statsTotal.scoredGoals || statsTotal.scoredGaols || 0;
        const goalsAgainst = statsTotal.receivedGoals || 0;
        
        return {
          id: row.id,
          position: row.rank,
          team: {
            id: row.team.id,
            name: row.team.name,
            logo: row.team.logo || '/placeholder.svg',
            slug: row.team.slug
          },
          played: statsTotal.gamesPlayed || statsTotal.games || 0,
          wins: statsTotal.wins || 0,
          draws: statsTotal.draws || 0,
          losses: statsTotal.loses || 0,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          goal_difference: goalsFor - goalsAgainst,
          points: statsTotal.points || 0,
          form: row.form,
          status: row.status,
          description: row.description,
          stage: row.group_name || undefined,
        };
      });

      setStandings(transformedStandings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch standings');
    } finally {
      setLoading(false);
    }
  };

  return {
    standings,
    loading,
    error,
    refetch: fetchStandings
  };
}