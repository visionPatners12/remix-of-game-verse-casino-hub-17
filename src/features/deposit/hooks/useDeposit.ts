import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { CryptoOption } from '@/types/wallet';
import { cryptoOptions } from '../config/crypto';
import { logger } from '@/utils/logger';

export const useDeposit = () => {
  const { user } = useAuth();
  const { address: safeAddress, isConnected } = useUnifiedWallet();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [ensSubdomain, setEnsSubdomain] = useState<string | null>(null);

  // Use Safe address directly from useUnifiedWallet + load ENS from DB
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingAddress(true);
      try {
        // Use Safe address directly from wallet hook
        if (safeAddress) {
          setSelectedCrypto(prev => ({
            ...prev,
            address: safeAddress
          }));
          logger.debug('[useDeposit] Using Safe address from wallet:', safeAddress);
        }

        // Load ENS subdomain from database
        if (user?.id) {
          const { data, error } = await supabase
            .from('users')
            .select('ens_subdomain')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            logger.error('[useDeposit] Error fetching ENS:', error);
          }

          if (data?.ens_subdomain) {
            setEnsSubdomain(data.ens_subdomain);
            logger.debug('[useDeposit] ENS subdomain loaded:', data.ens_subdomain);
          }
        }
      } catch (error) {
        logger.error('[useDeposit] Error loading data:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadData();
  }, [safeAddress, user?.id]);

  const handleCryptoChange = (crypto: CryptoOption) => {
    // Preserve the Safe address when changing crypto
    setSelectedCrypto({
      ...crypto,
      address: safeAddress || crypto.address
    });
  };

  return {
    selectedCrypto,
    cryptoOptions,
    handleCryptoChange,
    isLoadingAddress,
    ensSubdomain,
    // Expose Safe address for components that need it directly
    safeAddress
  };
};
