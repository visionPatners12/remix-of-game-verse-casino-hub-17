// Hook to manage Polymarket Safe address derivation and deployment status

import { useState, useCallback } from 'react';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { logger } from '@/utils/logger';

// Create public client for reading chain data
const publicClient = createPublicClient({
  chain: polygon,
  transport: http('https://polygon-rpc.com'),
});

export function useSafeDeployment() {
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a Safe contract is deployed at the given address
  const checkSafeDeployed = useCallback(async (address: string): Promise<boolean> => {
    setIsChecking(true);
    try {
      const code = await publicClient.getBytecode({ 
        address: address as `0x${string}` 
      });
      const deployed = code !== undefined && code !== '0x' && code.length > 2;
      setIsDeployed(deployed);
      logger.info('[SafeDeployment] Contract deployed:', deployed);
      return deployed;
    } catch (err) {
      logger.warn('[SafeDeployment] Failed to check deployment:', err);
      setIsDeployed(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Derive Safe address from EOA
  // Note: For Polymarket, users can trade directly with their EOA
  // The Safe derivation is optional and used for specific flows
  const deriveSafe = useCallback(async (eoaAddress: string): Promise<string> => {
    setError(null);
    
    try {
      logger.info('[SafeDeployment] Using EOA address for trading:', eoaAddress);
      
      // For now, we use the EOA address directly for trading
      // Polymarket supports both EOA and Smart Contract wallets
      // The ClobClient will handle the signature type appropriately
      setSafeAddress(eoaAddress);
      
      // Check if there's a contract at this address (could be a smart wallet)
      await checkSafeDeployed(eoaAddress);
      
      return eoaAddress;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to derive safe address';
      logger.error('[SafeDeployment] Error:', message);
      setError(message);
      throw err;
    }
  }, [checkSafeDeployed]);

  // Reset state
  const reset = useCallback(() => {
    setSafeAddress(null);
    setIsDeployed(false);
    setError(null);
  }, []);

  return {
    safeAddress,
    isDeployed,
    isChecking,
    error,
    deriveSafe,
    checkSafeDeployed,
    reset,
  };
}
