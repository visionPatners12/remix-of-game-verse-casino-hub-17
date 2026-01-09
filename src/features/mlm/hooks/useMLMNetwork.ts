import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

export interface ReferralMember {
  id: string;
  username: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
  staked: number;
  won: number;
}

export interface NetworkLevel {
  level: number;
  referrals_count: number;
  total_staked: number;
  total_won: number;
  net_margin: number;
  commission_rate: number;
  referrals: ReferralMember[];
}

export function useMLMNetwork() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mlm-network', user?.id],
    queryFn: async (): Promise<NetworkLevel[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use raw RPC call since social_post schema is not in types
      const { data, error } = await supabase.rpc('get_mlm_network' as any, { 
        p_user_id: user.id 
      });

      if (error) throw error;

      return (data || []) as NetworkLevel[];
    },
    enabled: !!user?.id,
  });
}
