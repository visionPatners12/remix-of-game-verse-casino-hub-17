import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { FootballStanding } from '@/types/standings/football';

export function useLeagueStandings(leagueId: string, season?: number) {
  return useQuery({
    queryKey: ['league-standings', leagueId, season],
    queryFn: async () => {
      // Étape 1 : Récupérer les standings
      let standingsQuery = sportsDataClient
        .from('standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true });

      if (season) {
        standingsQuery = standingsQuery.eq('season', season);
      }

      const { data: standingsData, error: standingsError } = await standingsQuery;
      
      if (standingsError) throw standingsError;
      if (!standingsData || standingsData.length === 0) return [];

      // Étape 2 : Extraire les team_ids uniques
      const teamIds = [...new Set(standingsData.map(s => s.team_id).filter(Boolean))];
      
      if (teamIds.length === 0) return [];

      // Étape 3 : Récupérer les infos des équipes
      const { data: teamsData, error: teamsError } = await sportsDataClient
        .from('teams')
        .select('id, name, display_name, logo, slug')
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      // Étape 4 : Créer un map pour lookup rapide
      const teamsMap = new Map(
        (teamsData || []).map(team => [team.id, team])
      );

      // Étape 5 : Combiner les données
      const transformedStandings: FootballStanding[] = standingsData.map((row: any) => {
        const team = teamsMap.get(row.team_id);
        const statsTotal = row.stats_total || {};
        
        // Détecter le format : nested (total exists), statistics array (NBA Highlightly), ou plat
        const isNestedFormat = !!statsTotal.total;
        const isStatisticsArrayFormat = Array.isArray(statsTotal.statistics);
        
        if (isStatisticsArrayFormat) {
          // Format NBA Highlightly avec statistics[]
          const getStatValue = (name: string): string | number | undefined => {
            const stat = statsTotal.statistics.find((s: any) => s.displayName === name);
            return stat?.value;
          };
          
          const wins = parseInt(String(getStatValue('Wins') || '0'), 10);
          const losses = parseInt(String(getStatValue('Losses') || '0'), 10);
          const position = parseInt(String(getStatValue('Position') || '0'), 10);
          
          return {
            id: row.id,
            position: position || row.rank || 0,
            team: {
            id: team?.id || row.team_id,
              name: team?.name || 'Unknown Team',
              logo: team?.logo || '/placeholder.svg',
              slug: team?.slug
            },
            played: wins + losses,
            wins,
            draws: 0,
            losses,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
            form: row.form,
            status: null,
            description: row.description,
            stage: row.stage || row.group_name || undefined,
            win_pct: getStatValue('Win Percentage'),
            games_behind: undefined,
            conference: row.conference || row.group_name,
            division: row.division,
            streak: String(getStatValue('Streak') || ''),
            group_name: row.group_name,
            raw_stats: statsTotal,
          };
        }
        
        if (isNestedFormat) {
          // Format nested (UEFA Champions League, La Liga, etc.)
          const totalStats = statsTotal.total || {};
          const homeStats = statsTotal.home || {};
          const awayStats = statsTotal.away || {};
          
          return {
            id: row.id,
            position: row.rank,
            team: {
            id: team?.id || row.team_id,
              name: team?.name || 'Unknown Team',
              logo: team?.logo || '/placeholder.svg',
              slug: team?.slug
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
            status: null,
            description: row.description,
            stage: row.group_name || row.stage || undefined,
            // Basketball/NBA specific fields
            win_pct: row.win_pct,
            games_behind: row.games_behind,
            conference: row.conference || row.group_name,
            division: row.division,
            streak: row.streak,
            group_name: row.group_name,
          };
        }
        
        // Format plat (Handball, etc.) avec gestion de la faute "scoredGaols"
        const goalsFor = statsTotal.scoredGoals || statsTotal.scoredGaols || 0;
        const goalsAgainst = statsTotal.receivedGoals || 0;
        
        return {
          id: row.id,
          position: row.rank,
          team: {
            id: team?.id || row.team_id,
            name: team?.name || 'Unknown Team',
            logo: team?.logo || '/placeholder.svg',
            slug: team?.slug
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
          status: null,
          description: row.description,
          stage: row.group_name || row.stage || undefined,
          // Basketball/NBA specific fields
          win_pct: row.win_pct,
          games_behind: row.games_behind,
          conference: row.conference || row.group_name,
          division: row.division,
          streak: row.streak,
          group_name: row.group_name,
        };
      });

      return transformedStandings;
    },
    staleTime: 60_000,
    enabled: !!leagueId,
  });
}
