
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { CryptoOption } from '@/types/wallet';
import { cryptoOptions } from '../config/crypto';
import { logger } from '@/utils/logger';

export const useDeposit = () => {
  const { user } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [ensSubdomain, setEnsSubdomain] = useState<string | null>(null);

  // Check for existing address or generate new one when component mounts
  useEffect(() => {
    loadOrGenerateAddress();
  }, []);

  const loadOrGenerateAddress = async () => {
    setIsLoadingAddress(true);
    try {
      if (!user) return;

      // Fetch wallet address and ENS subdomain in parallel
      const [walletResult, userResult] = await Promise.all([
        supabase
          .from('user_wallet')
          .select('wallet_address')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('users')
          .select('ens_subdomain')
          .eq('id', user.id)
          .maybeSingle()
      ]);

      if (walletResult.error) {
        logger.error('Error fetching user wallet:', walletResult.error);
      }

      if (userResult.error) {
        logger.error('Error fetching user ENS:', userResult.error);
      }

      if (walletResult.data?.wallet_address) {
        setSelectedCrypto(prev => ({
          ...prev,
          address: walletResult.data.wallet_address
        }));
      }

      if (userResult.data?.ens_subdomain) {
        setEnsSubdomain(userResult.data.ens_subdomain);
      }
    } catch (error) {
      logger.error('Error loading address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleCryptoChange = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
  };

  return {
    selectedCrypto,
    cryptoOptions,
    handleCryptoChange,
    isLoadingAddress,
    ensSubdomain
  };
};
