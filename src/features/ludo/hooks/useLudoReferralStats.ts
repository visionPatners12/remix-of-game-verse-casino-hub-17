import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

export interface LudoReferralStats {
  total_n1_referrals: number;
  total_n2_referrals: number;
  total_games_n1: number;
  total_games_n2: number;
  total_earnings_n1: number;
  total_earnings_n2: number;
  total_staked_n1: number;
  total_staked_n2: number;
  pending_earnings: number;
  credited_earnings: number;
  paid_earnings: number;
  period_start: string;
  period_end: string;
  period_days: number;
  referral_code: string | null;
}

const DEFAULT_STATS: LudoReferralStats = {
  total_n1_referrals: 0,
  total_n2_referrals: 0,
  total_games_n1: 0,
  total_games_n2: 0,
  total_earnings_n1: 0,
  total_earnings_n2: 0,
  total_staked_n1: 0,
  total_staked_n2: 0,
  pending_earnings: 0,
  credited_earnings: 0,
  paid_earnings: 0,
  period_start: '',
  period_end: '',
  period_days: 30,
  referral_code: null,
};

export function useLudoReferralStats(periodDays: number = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ludo-referral-stats', user?.id, periodDays],
    queryFn: async (): Promise<LudoReferralStats> => {
      if (!user?.id) return DEFAULT_STATS;

      // Use any to bypass type checking since the RPC function isn't in generated types yet
      const { data, error } = await (supabase.rpc as any)('get_ludo_referral_stats', {
        p_user_id: user.id,
        p_period_days: periodDays,
      });

      if (error) {
        console.error('Failed to fetch ludo referral stats:', error);
        return DEFAULT_STATS;
      }

      return data as LudoReferralStats;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Get total earnings from Ludo referrals
 */
export function useLudoReferralTotalEarnings(periodDays: number = 30) {
  const { data: stats } = useLudoReferralStats(periodDays);

  if (!stats) return 0;

  return stats.total_earnings_n1 + stats.total_earnings_n2;
}

/**
 * Get total staked by referrals
 */
export function useLudoReferralTotalStaked(periodDays: number = 30) {
  const { data: stats } = useLudoReferralStats(periodDays);

  if (!stats) return 0;

  return stats.total_staked_n1 + stats.total_staked_n2;
}
