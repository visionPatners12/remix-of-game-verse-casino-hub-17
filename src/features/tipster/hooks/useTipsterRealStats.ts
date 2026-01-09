import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { socialClient } from '@/integrations/supabase/client';

export interface TipsterRealStats {
  period: string;
  tips: number;
  wins: number;
  losses: number;
  tipsOpen: number;
  avgOdds: number;
  profit: number;
  yield: number;
  winRate: number;
  form: string;
  firstTipAt: string | null;
  lastTipAt: string | null;
}

export interface RecentSelection {
  id: string;
  predictionId: string;
  homeTeamName: string;
  homeTeamImage: string | null;
  awayTeamName: string;
  awayTeamImage: string | null;
  leagueName: string;
  leagueLogo: string | null;
  pick: string;
  marketType: string;
  odds: number;
  isWon: boolean | null;
  startsAt: string;
  createdAt: string;
}

interface LeaderboardRow {
  period: string;
  user_id: string;
  sport_id: string | null;
  tips: number;
  wins: number;
  losses: number;
  avg_odds: number;
  profit: number;
  yield: number;
  win_rate: number;
  first_tip_at: string | null;
  last_tip_at: string | null;
  tips_open: number;
  form: string;
}

interface SelectionRow {
  id: string;
  prediction_id: string;
  home_team_name: string | null;
  home_team_image: string | null;
  away_team_name: string | null;
  away_team_image: string | null;
  league_name: string | null;
  league_logo: string | null;
  pick: string | null;
  market_type: string | null;
  odds: number;
  is_won: boolean | null;
  starts_at: string;
  created_at: string;
}

export function useTipsterRealStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TipsterRealStats | null>(null);
  const [recentSelections, setRecentSelections] = useState<RecentSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch leaderboard stats for all_time period
        const { data: leaderboardData, error: leaderboardError } = await socialClient
          .from('v_tipster_leaderboard')
          .select('*')
          .eq('user_id', user.id)
          .eq('period', 'all_time')
          .maybeSingle();

        if (leaderboardError) {
          console.error('Error fetching leaderboard stats:', leaderboardError);
        }

        if (leaderboardData) {
          // Type assertion with proper interface - view returns this structure
          const row: LeaderboardRow = {
            period: leaderboardData.period,
            user_id: leaderboardData.user_id,
            sport_id: leaderboardData.sport_id ?? null,
            tips: leaderboardData.tips ?? 0,
            wins: leaderboardData.wins ?? 0,
            losses: leaderboardData.losses ?? 0,
            avg_odds: leaderboardData.avg_odds ?? 0,
            profit: leaderboardData.profit ?? 0,
            yield: leaderboardData.yield ?? 0,
            win_rate: leaderboardData.win_rate ?? 0,
            first_tip_at: leaderboardData.first_tip_at ?? null,
            last_tip_at: leaderboardData.last_tip_at ?? null,
            tips_open: leaderboardData.tips_open ?? 0,
            form: leaderboardData.form ?? '',
          };
          setStats({
            period: row.period,
            tips: Number(row.tips) || 0,
            wins: Number(row.wins) || 0,
            losses: Number(row.losses) || 0,
            tipsOpen: Number(row.tips_open) || 0,
            avgOdds: Number(row.avg_odds) || 0,
            profit: Number(row.profit) || 0,
            yield: Number(row.yield) || 0,
            winRate: Number(row.win_rate) || 0,
            form: row.form || '',
            firstTipAt: row.first_tip_at,
            lastTipAt: row.last_tip_at,
          });
        }

        // Fetch recent selections with prediction details
        const { data: predictionsData, error: predictionsError } = await socialClient
          .from('predictions')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (predictionsError) {
          console.error('Error fetching predictions:', predictionsError);
        }

        if (predictionsData && predictionsData.length > 0) {
          const predictionIds = predictionsData.map(p => p.id);
          
          const { data: selectionsData, error: selectionsError } = await socialClient
            .from('selections')
            .select('*')
            .in('prediction_id', predictionIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (selectionsError) {
            console.error('Error fetching selections:', selectionsError);
          }

          if (selectionsData) {
            setRecentSelections(selectionsData.map(s => ({
              id: s.id,
              predictionId: s.prediction_id,
              homeTeamName: s.home_team_name || 'Team A',
              homeTeamImage: s.home_team_image,
              awayTeamName: s.away_team_name || 'Team B',
              awayTeamImage: s.away_team_image,
              leagueName: s.league_name || '',
              leagueLogo: s.league_logo,
              pick: s.pick || '',
              marketType: s.market_type || '',
              odds: Number(s.odds) || 0,
              isWon: s.is_won,
              startsAt: s.starts_at,
              createdAt: s.created_at,
            })));
          }
        }
      } catch (err) {
        console.error('Error in useTipsterRealStats:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return {
    stats,
    recentSelections,
    isLoading,
    error,
  };
}
