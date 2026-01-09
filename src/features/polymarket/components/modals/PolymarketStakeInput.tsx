import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolymarketStakeInputProps {
  value: number;
  onChange: (value: number) => void;
  minBet?: number;
  error?: string;
  className?: string;
}

export function PolymarketStakeInput({ 
  value, 
  onChange, 
  minBet = 1,
  error,
  className 
}: PolymarketStakeInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^0-9.]/g, '');
    const newValue = parseFloat(cleanValue) || 0;
    onChange(newValue);
  };

  const hasError = !!error || (value > 0 && value < minBet);

  return (
    <div className={cn("space-y-2", className)}>
      <motion.div
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 2px hsl(var(--primary) / 0.3)' 
            : hasError 
              ? '0 0 0 2px hsl(var(--destructive) / 0.3)'
              : 'none'
        }}
        className={cn(
          "relative flex items-center gap-2 rounded-xl overflow-hidden",
          "bg-muted/30 border transition-colors duration-200",
          isFocused ? "border-primary" : hasError ? "border-destructive" : "border-border/50",
        )}
      >
        {/* Currency Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>

        {/* Input */}
        <input
          type="text"
          inputMode="decimal"
          value={value || ''}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="0.00"
          className={cn(
            "flex-1 bg-transparent text-lg font-bold text-foreground",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none",
            "appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />

        {/* Currency Label */}
        <div className="pr-3 text-sm font-medium text-muted-foreground">
          USDC
        </div>
      </motion.div>

      {/* Min Bet Info */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Min: ${minBet.toFixed(2)}</span>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive px-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
