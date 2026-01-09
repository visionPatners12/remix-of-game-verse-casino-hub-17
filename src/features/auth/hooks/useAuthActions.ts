import { useCallback } from 'react';
import { useLogout } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { performFullLogout } from '@/utils/logout';
import { logger } from '@/utils/logger';
import { SignUpData, SignInData } from '../types';
import { parseAuthError } from '../lib/authHelpers';
import { getReferralCode, clearReferralCode } from '@/features/mlm/hooks/useReferralStorage';

/**
 * Simplified auth actions hook following KISS principles
 */
export function useAuthActions() {
  const { logout: privyLogout } = useLogout();

  const signUp = useCallback(async (data: SignUpData) => {
    logger.auth("Starting signup...");
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/token-confirmation`,
        data: {
          username: data.username,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          country: data.country,
          date_of_birth: data.dateOfBirth?.toISOString(),
          auth_method: 'email_password',
        }
      }
    });
    
    if (error) {
      throw new Error(parseAuthError(error));
    }
    
    // Process referral if a code is saved in localStorage
    const referralCode = getReferralCode();
    if (referralCode && authData?.user?.id) {
      try {
        await supabase.rpc('process_referral_signup' as any, {
          p_referred_id: authData.user.id,
          p_code: referralCode,
        });
        clearReferralCode();
        logger.auth('Referral processed successfully');
      } catch (e) {
        logger.error('Referral processing failed:', e);
        // Don't throw - signup succeeded, referral is optional
      }
    }
    
    logger.auth('Signup successful');
  }, []);

  const signIn = useCallback(async (data: SignInData) => {
    logger.auth("Starting signin...");
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) {
      throw new Error(parseAuthError(error));
    }
    
    logger.auth('Signin successful');
  }, []);

  const signOut = useCallback(async () => {
    logger.auth('Starting sign out...');
    
    await performFullLogout({ 
      privyLogout, 
      preserveKeys: ['theme', 'language', 'user-preferences'] 
    });
    window.location.href = '/auth';
  }, [privyLogout]);

  const refreshSession = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw new Error(error.message);
  }, []);

  return {
    signUp,
    signIn,
    signOut,
    refreshSession
  };
}