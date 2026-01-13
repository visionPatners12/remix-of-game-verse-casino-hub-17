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
  pending_earnings: number;
  credited_earnings: number;
  paid_earnings: number;
}

const DEFAULT_STATS: LudoReferralStats = {
  total_n1_referrals: 0,
  total_n2_referrals: 0,
  total_games_n1: 0,
  total_games_n2: 0,
  total_earnings_n1: 0,
  total_earnings_n2: 0,
  pending_earnings: 0,
  credited_earnings: 0,
  paid_earnings: 0,
};

export function useLudoReferralStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ludo-referral-stats', user?.id],
    queryFn: async (): Promise<LudoReferralStats> => {
      if (!user?.id) return DEFAULT_STATS;

      // Use any to bypass type checking since the RPC function isn't in generated types yet
      const { data, error } = await (supabase.rpc as any)('get_ludo_referral_stats', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Failed to fetch ludo referral stats:', error);
        return DEFAULT_STATS;
      }

      return data as LudoReferralStats;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes (optimisé)
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false, // Économise des requêtes
    refetchOnMount: false,
  });
}

/**
 * Get total earnings from Ludo referrals
 */
export function useLudoReferralTotalEarnings() {
  const { data: stats } = useLudoReferralStats();

  if (!stats) return 0;

  return stats.total_earnings_n1 + stats.total_earnings_n2;
}
