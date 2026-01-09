import React from 'react';
import { useMaxBet } from '@azuro-org/sdk';
import type { BetMode } from '../../types';

interface FinancialSummaryProps {
  selections: AzuroSDK.BetslipItem[];
  stake: number;
  totalOdds: number;
  potentialWin: number;
  currency: string;
  mode: BetMode;
  maxBet?: number;
  isMaxBetFetching?: boolean;
}

export function FinancialSummary({ selections, stake, totalOdds, potentialWin, currency, mode, maxBet, isMaxBetFetching }: FinancialSummaryProps) {
  const calculateValues = () => {
    if (selections.length === 0 || stake === 0) {
      return {
        totalToPay: 0,
        potentialPayout: 0,
        potentialProfit: 0
      };
    }

    const potentialPayout = potentialWin;
    const potentialProfit = potentialPayout - stake;

    return {
      totalToPay: stake,
      potentialPayout,
      potentialProfit
    };
  };

  const values = calculateValues();

  if (mode === 'AGAINST_PLAYER') {
    const houseCommission = values.potentialPayout * 0.05;
    const netPayout = values.potentialPayout * 0.95;
    const netProfit = netPayout - values.totalToPay;
    const betOpponent = values.potentialPayout - values.totalToPay; // payout - stake

    return (
      <div className="space-y-3 mt-4 p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
        <div className="flex justify-between items-center h-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">BET OPPONENT</span>
          <span className="text-sm font-semibold text-foreground min-w-[90px] text-right">
            {betOpponent?.toFixed(2) || '0.00'} USDT
          </span>
        </div>
        <div className="w-full h-px bg-border/30"></div>
        <div className="flex justify-between items-center h-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PAYOUT</span>
          <span className="text-sm font-semibold text-foreground min-w-[90px] text-right">
            {values.potentialPayout?.toFixed(2) || '0.00'} USDT
          </span>
        </div>
        <div className="flex justify-between items-center h-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">HOUSE COMMISSION (5%)</span>
          <span className="text-sm font-semibold text-orange-600 min-w-[90px] text-right">
            -{houseCommission.toFixed(2)} USDT
          </span>
        </div>
        <div className="w-full h-px bg-border/30"></div>
        <div className="flex justify-between items-center h-6">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">NET PAYOUT</span>
          <span className="text-sm font-bold text-green-600 min-w-[90px] text-right">
            {netPayout.toFixed(2)} USDT
          </span>
        </div>
        <div className="flex justify-between items-center h-6">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">NET PROFIT</span>
          <span className="text-sm font-bold text-green-600 min-w-[90px] text-right">
            +{netProfit.toFixed(2)} USDT
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4 p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
      <div className="flex justify-between items-center h-6">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">MAX BET</span>
        <span className="text-sm font-semibold text-foreground min-w-[90px] text-right">
          {isMaxBetFetching ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${Number(maxBet || 0).toFixed(2)} ${currency}`
          )}
        </span>
      </div>
      <div className="w-full h-px bg-border/30"></div>
      <div className="flex justify-between items-center h-6">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">TOTAL TO PAY</span>
        <span className="text-sm font-semibold text-foreground min-w-[90px] text-right">
          {values.totalToPay?.toFixed(2) || '0.00'} USDT
        </span>
      </div>
      <div className="flex justify-between items-center h-6">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PAYOUT</span>
        <span className="text-sm font-semibold text-foreground min-w-[90px] text-right">
          {values.potentialPayout?.toFixed(2) || '0.00'} USDT
        </span>
      </div>
      <div className="w-full h-px bg-border/30"></div>
      <div className="flex justify-between items-center h-6">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">POTENTIAL PROFIT</span>
        <span className="text-sm font-bold text-green-600 min-w-[90px] text-right">
          {values.potentialProfit?.toFixed(2) || '0.00'} USDT
        </span>
      </div>
    </div>
  );
}