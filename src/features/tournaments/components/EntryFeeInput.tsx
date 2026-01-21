import React from 'react';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EntryFeeInputProps {
  value: number;
  onChange: (value: number) => void;
}

const QUICK_AMOUNTS = [1, 5, 10, 25];

export const EntryFeeInput = ({ value, onChange }: EntryFeeInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <DollarSign className="h-4 w-4" />
        <span>Entry Fee per Player</span>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          $
        </div>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-14 text-center text-2xl font-bold bg-muted/30 border-0 rounded-xl pl-8 pr-16"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
          USDC
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(amount)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              value === amount
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            ${amount}
          </button>
        ))}
      </div>

      {value === 0 && (
        <p className="text-center text-sm text-muted-foreground bg-muted/20 rounded-lg py-2">
          Free tournament - no entry fee required
        </p>
      )}
    </div>
  );
};
