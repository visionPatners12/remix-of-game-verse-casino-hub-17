import { useMemo } from 'react';
import type { BetMode, FinancialCalculations } from '../types';
import { useCasinoCommission } from '@/hooks/useCasinoCommission';

interface UseFinancialCalculationsProps {
  stake: number;
  totalOdds: number;
  mode: BetMode;
  maxBet?: number;
  minBet?: number;
}

export function useFinancialCalculations({ stake, totalOdds, mode, maxBet, minBet }: UseFinancialCalculationsProps): FinancialCalculations {
  const { commissionDecimal } = useCasinoCommission();
  
  return useMemo(() => {
    const potentialPayout = stake * totalOdds;
    const xpEarned = Math.floor(stake * 0.1);
    
    const baseCalculations: FinancialCalculations = {
      totalOdds,
      potentialPayout,
      maxPayout: maxBet || 1000000,
      minBet: minBet || 1,
      xpEarned,
      bonusMultiplier: 1,
    };

    if (mode === 'AGAINST_PLAYER') {
      const houseCommission = potentialPayout * commissionDecimal;
      const netPayout = potentialPayout * (1 - commissionDecimal);
      const netProfit = netPayout - stake;

      return {
        ...baseCalculations,
        houseCommission,
        netPayout,
        netProfit,
      };
    }

    return baseCalculations;
  }, [stake, totalOdds, mode, maxBet, minBet, commissionDecimal]);
}