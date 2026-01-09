// Hook to manage token approvals for Polymarket trading

import { useState, useCallback } from 'react';
import { checkAllApprovals, createAllApprovalTxs } from '../utils/approvals';
import type { ApprovalStatus } from '../types/trading';
import { logger } from '@/utils/logger';

export function useTokenApprovals() {
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check all required approvals for a given address
  const checkApprovals = useCallback(async (address: string): Promise<ApprovalStatus> => {
    setIsChecking(true);
    setError(null);

    try {
      logger.info('[TokenApprovals] Checking approvals for:', address);
      const status = await checkAllApprovals(address);
      setApprovalStatus(status);
      logger.info('[TokenApprovals] All approved:', status.allApproved);
      return status;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check approvals';
      logger.error('[TokenApprovals] Check error:', message);
      setError(message);
      return { allApproved: false, usdcApprovals: {}, ctfApprovals: {} };
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Set all required approvals by sending transactions
  const setApprovals = useCallback(async (
    walletClient: any,
    address: string
  ): Promise<boolean> => {
    setIsApproving(true);
    setError(null);

    try {
      logger.info('[TokenApprovals] Setting approvals...');
      const txs = createAllApprovalTxs();

      // Send each approval transaction
      for (const tx of txs) {
        logger.info('[TokenApprovals] Sending tx to:', tx.to);
        
        const hash = await walletClient.sendTransaction({
          to: tx.to as `0x${string}`,
          data: tx.data as `0x${string}`,
          value: BigInt(tx.value),
        });

        logger.info('[TokenApprovals] Tx sent:', hash);
      }

      // Re-check approvals after setting
      const status = await checkApprovals(address);
      
      if (!status.allApproved) {
        logger.warn('[TokenApprovals] Some approvals still missing after setting');
      }

      return status.allApproved;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set approvals';
      logger.error('[TokenApprovals] Set error:', message);
      setError(message);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [checkApprovals]);

  // Reset state
  const reset = useCallback(() => {
    setApprovalStatus(null);
    setError(null);
  }, []);

  return {
    approvalStatus,
    checkApprovals,
    setApprovals,
    isChecking,
    isApproving,
    error,
    allApproved: approvalStatus?.allApproved ?? false,
    reset,
  };
}
