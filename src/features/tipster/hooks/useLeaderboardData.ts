import { useQuery } from '@tanstack/react-query';
import { socialClient } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { TipsterStats } from '@/types/tipster';
import { useSportMapping } from '@/hooks/useSportMapping';

export type TimeFrame = 'all' | 'month' | 'week';

// Mapping des timeframes vers les valeurs de period dans la view
const periodMap: Record<TimeFrame, string> = {
  'all': 'all_time',
  'month': 'this_month',
  'week': 'this_week'
};

interface LeaderboardRow {
  user_id: string;
  sport_id: string;
  period: string;
  tips: number;
  wins: number;
  losses: number;
  tips_open: number;
  avg_odds: number;
  profit: number;
  yield: number;
  win_rate: number;
  form: string;
  first_tip_at: string;
  last_tip_at: string;
}

export function useLeaderboardData(timeframe: TimeFrame = 'all', sportId: string = 'all') {
  const { data: sportMapping } = useSportMapping();
  
  return useQuery({
    queryKey: ['tipster-leaderboard', timeframe, sportId],
    queryFn: async () => {
      // Build query with period filter
      let query = socialClient
        .from('mv_tipster_leaderboard')
        .select('*')
        .eq('period', periodMap[timeframe]);
      
      // Add sport filter if selected
      if (sportId !== 'all' && sportMapping) {
        const sportUUID = sportMapping.get(sportId);
        if (sportUUID) {
          query = query.eq('sport_id', sportUUID);
        }
      }
      
      const { data: leaderboardData, error: leaderboardError } = await query
        .order('yield', { ascending: false })
        .limit(100);
      
      if (leaderboardError) throw leaderboardError;
      if (!leaderboardData || leaderboardData.length === 0) return [];
      
      // 3. Get user info
      const userIds = leaderboardData.map((row: any) => row.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, avatar_url, country')
        .in('id', userIds);
      
      if (usersError) throw usersError;
      
      // 4. Create users map
      const usersMap = new Map(
        (usersData || []).map(user => [user.id, user])
      );
      
      // 5. Transform to TipsterStats
      return leaderboardData.map((row: LeaderboardRow, index: number) => {
        const user = usersMap.get(row.user_id);
        const formArray = (row.form || '').split('').filter((c: string) => c === 'W' || c === 'L') as ('W' | 'L')[];
        
        return {
          id: row.user_id,
          username: user?.username || '',
          name: user?.username || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown',
          avatar: user?.avatar_url || '',
          verified: false,
          rank: index + 1,
          yield: Number(row.yield) * 100,
          totalTips: Number(row.tips),
          wins: Number(row.wins),
          avgOdds: Number(row.avg_odds),
          form: formArray,
          openTips: Number(row.tips_open),
          winRate: Number(row.win_rate) * 100,
          streak: 0,
          country: user?.country || '',
          level: 1,
          followers: 0
        } as TipsterStats;
      });
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });
}
