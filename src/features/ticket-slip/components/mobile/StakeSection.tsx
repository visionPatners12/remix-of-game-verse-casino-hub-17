import React from 'react';
import { StakeInputRow, TotalQuoteRow, FinancialSummary, QuickStakeButtons } from '../';
import type { BetMode, Currency } from '../../types';

interface StakeSectionProps {
  mode: BetMode;
  stake: number;
  currency: Currency;
  onChange: (value: number) => void;
  maxBet?: number;
  minBet?: number;
  isMaxBetFetching: boolean;
  disableReason?: string;
  selections: any[];
  selectionsCount: number;
  totalOdds: number;
  potentialWin: number;
  onStakeSelect: (value: number) => void;
  onClearAll: () => void;
}

export function StakeSection({
  mode,
  stake,
  currency,
  onChange,
  maxBet,
  minBet,
  isMaxBetFetching,
  disableReason,
  selections,
  selectionsCount,
  totalOdds,
  potentialWin,
  onStakeSelect,
  onClearAll
}: StakeSectionProps) {
  return (
    <div className="border-t border-border/10">
      {/* Stake Input */}
      <div className="px-4 py-3 border-b border-border/10">
        <StakeInputRow
          mode={mode}
          stake={stake}
          currency={currency}
          onChange={onChange}
          maxBet={maxBet}
          minBet={minBet}
          isMaxBetFetching={isMaxBetFetching}
          disableReason={disableReason}
        />
      </div>

      {/* Quick Stakes */}
      <div className="px-4 py-3 border-b border-border/10">
        <QuickStakeButtons
          onStakeSelect={onStakeSelect}
          currency={currency}
          currentStake={stake}
        />
      </div>

      {/* Total Quote */}
      <div className="px-4 py-3 border-b border-border/10">
        <TotalQuoteRow
          selections={selections as any}
          mode={mode}
          selectionsCount={selectionsCount}
          totalOdds={totalOdds}
          onClearAll={onClearAll}
        />
      </div>

      {/* Financial Summary */}
      <div className="px-4 py-3">
        <FinancialSummary
          selections={selections as any}
          stake={stake}
          totalOdds={totalOdds}
          potentialWin={potentialWin}
          currency={currency}
          mode={mode}
          maxBet={maxBet}
          isMaxBetFetching={isMaxBetFetching}
        />
      </div>
    </div>
  );
}