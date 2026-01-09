import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BetAmountSectionProps {
  betAmount: number;
  currency: string;
  selectedPrediction: any;
  onBetAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
}

export function BetAmountSection({ 
  betAmount, 
  currency, 
  selectedPrediction,
  onBetAmountChange,
  onCurrencyChange 
}: BetAmountSectionProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium mb-3 block">
        Bet amount (optional)
      </Label>
      <div className="flex gap-3">
        <Input
          type="number"
          value={betAmount || ''}
          onChange={(e) => onBetAmountChange(Number(e.target.value) || 0)}
          placeholder="Amount"
          className="flex-1 rounded-2xl border-2 focus:border-primary"
          min="0"
          step="0.01"
        />
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="px-4 py-2 rounded-2xl border-2 border-input bg-background focus:border-primary focus:outline-none"
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="STX">STX</option>
        </select>
      </div>
      {betAmount > 0 && selectedPrediction && (
        <div className="mt-2 text-sm text-muted-foreground">
          Potential win: {(betAmount * (selectedPrediction.selectedOutcome?.odds || 1)).toFixed(2)} {currency}
        </div>
      )}
    </div>
  );
}