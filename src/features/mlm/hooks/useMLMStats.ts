import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

export interface MLMStats {
  total_referrals: number;
  total_n1: number;
  total_n2: number;
  total_n3: number;
  total_staked: number;
  total_won: number;
  total_margin: number;
  total_earnings: number;
  pending_earnings: number;
  referral_code: string | null;
}

export function useMLMStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mlm-stats', user?.id],
    queryFn: async (): Promise<MLMStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // Call the RPC function
        const { data, error } = await supabase.rpc('get_mlm_stats' as any, { 
          p_user_id: user.id 
        });

        if (!error && data) {
          return data as MLMStats;
        }
      } catch {
        // Fallback if RPC fails
      }

      // Fallback: get referral_code directly from users table
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      return {
        total_referrals: 0,
        total_n1: 0,
        total_n2: 0,
        total_n3: 0,
        total_staked: 0,
        total_won: 0,
        total_margin: 0,
        total_earnings: 0,
        pending_earnings: 0,
        referral_code: userData?.referral_code || null,
      };
    },
    enabled: !!user?.id,
  });
}
