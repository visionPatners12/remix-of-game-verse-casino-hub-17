import { useMemo } from 'react';
import type { BetMode, FinancialCalculations } from '../types';

interface UseFinancialCalculationsProps {
  stake: number;
  totalOdds: number;
  mode: BetMode;
  maxBet?: number;
  minBet?: number;
}

export function useFinancialCalculations({ stake, totalOdds, mode, maxBet, minBet }: UseFinancialCalculationsProps): FinancialCalculations {
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
      const houseCommission = potentialPayout * 0.05;
      const netPayout = potentialPayout * 0.95;
      const netProfit = netPayout - stake;

      return {
        ...baseCalculations,
        houseCommission,
        netPayout,
        netProfit,
      };
    }

    return baseCalculations;
  }, [stake, totalOdds, mode, maxBet, minBet]);
}