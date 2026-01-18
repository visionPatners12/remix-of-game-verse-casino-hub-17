import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { logger } from '@/utils/logger';

/**
 * Hook to fetch the user's ENS subdomain from the database.
 * Used for onramp/offramp flows to display a human-readable address.
 */
export const useEnsSubdomain = () => {
  const { user } = useAuth();
  const [ensSubdomain, setEnsSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEns = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('ens_subdomain')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          logger.error('[useEnsSubdomain] Error fetching ENS:', error);
        } else if (data?.ens_subdomain) {
          setEnsSubdomain(data.ens_subdomain);
          logger.debug('[useEnsSubdomain] ENS loaded:', data.ens_subdomain);
        }
      } catch (err) {
        logger.error('[useEnsSubdomain] Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEns();
  }, [user?.id]);

  return { ensSubdomain, isLoading };
};
