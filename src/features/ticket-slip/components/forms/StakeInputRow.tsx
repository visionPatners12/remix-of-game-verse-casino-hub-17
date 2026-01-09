import React from 'react';
import { Button } from '@/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BetMode, Currency } from '../../types';

interface StakeInputRowProps {
  mode: BetMode;
  stake: number;
  currency: Currency;
  onChange: (stake: number) => void;
  maxBet?: number;
  minBet?: number;
  isMaxBetFetching?: boolean;
  disableReason?: string;
}

export function StakeInputRow({ mode, stake, currency, onChange, maxBet, minBet, isMaxBetFetching, disableReason }: StakeInputRowProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    
    // Validate against min and max bet limits
    if (maxBet && value > maxBet) {
      onChange(maxBet);
      return;
    }
    
    onChange(value);
  };

  const handleMaxClick = () => {
    if (maxBet) {
      onChange(maxBet);
    }
  };

  // Show validation messages
  const getValidationMessage = () => {
    if (disableReason) return disableReason;
    if (minBet && stake > 0 && stake < minBet) {
      return `Minimum bet: ${minBet} ${currency}`;
    }
    if (maxBet && stake > maxBet) {
      return `Maximum bet: ${maxBet} ${currency}`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 h-12">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          BUY-IN
        </label>
        
        <div className="flex-1 relative">
          <input
            type="number"
            value={stake || ''}
            onChange={handleInputChange}
            placeholder="0.00"
            min={minBet || 0}
            max={maxBet || undefined}
            className={`w-full h-11 px-4 pr-12 text-sm font-medium border rounded-lg bg-background/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
              validationMessage 
                ? 'border-destructive focus:ring-destructive/30 focus:border-destructive/50' 
                : 'border-border focus:ring-primary/30 focus:border-primary/50'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {currency}
          </div>
        </div>
        
        {mode !== 'AGAINST_PLAYER' && maxBet && maxBet > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMaxClick}
            disabled={isMaxBetFetching}
            className="h-11 px-6 text-xs font-semibold rounded-lg bg-gradient-to-r from-muted to-muted/80 hover:from-primary/10 hover:to-primary/5 border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md disabled:opacity-50"
          >
            {isMaxBetFetching ? '...' : 'MAX'}
          </Button>
        )}
      </div>
      
      {validationMessage && (
        <p className="text-xs text-destructive ml-16">
          {validationMessage}
        </p>
      )}
    </div>
  );
}