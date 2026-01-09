import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

export function useGenerateReferralCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<string> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use raw RPC call since social_post schema is not in types
      const { data, error } = await supabase.rpc('generate_referral_code' as any, { 
        p_user_id: user.id 
      });

      if (error) throw error;

      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlm-stats'] });
    },
  });
}

export function useValidateReferralCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      // Use raw RPC call since social_post schema is not in types
      const { data, error } = await supabase.rpc('validate_referral_code' as any, { 
        p_code: code 
      });

      if (error) throw error;

      if (!data || (Array.isArray(data) && data.length === 0)) {
        return { is_valid: false, referrer_id: null, referrer_username: null };
      }

      const result = Array.isArray(data) ? data[0] : data;
      return result as {
        is_valid: boolean;
        referrer_id: string;
        referrer_username: string;
      };
    },
  });
}

export function useProcessReferralSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referredId,
      code,
    }: {
      referredId: string;
      code: string;
    }) => {
      // Use raw RPC call since social_post schema is not in types
      const { data, error } = await supabase.rpc('process_referral_signup' as any, {
        p_referred_id: referredId,
        p_code: code,
      });

      if (error) throw error;

      return data as {
        success: boolean;
        error?: string;
        n1?: string;
        n2?: string;
        n3?: string;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['mlm-network'] });
    },
  });
}
