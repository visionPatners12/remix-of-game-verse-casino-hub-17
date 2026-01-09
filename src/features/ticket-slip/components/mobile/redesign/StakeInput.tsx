import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StakeInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  minBet?: number;
  maxBet?: number;
  error?: string;
  className?: string;
  onMaxClick?: () => void;
}

export function StakeInput({ 
  value, 
  onChange, 
  currency = 'USDT',
  minBet,
  maxBet,
  error,
  className,
  onMaxClick
}: StakeInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  const isValid = !error && value > 0;
  const hasError = !!error || (minBet !== undefined && value < minBet);

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
          type="number"
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
          style={{ MozAppearance: 'textfield' }}
        />

        {/* Max Button */}
        {onMaxClick && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMaxClick}
            className="px-3 py-1.5 mr-2 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            MAX
          </motion.button>
        )}

        {/* Currency Label */}
        <div className="pr-3 text-sm font-medium text-muted-foreground flex-shrink-0 whitespace-nowrap">
          {currency}
        </div>
      </motion.div>

      {/* Min/Max Info */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {minBet !== undefined && (
          <span>Min: ${minBet.toFixed(2)}</span>
        )}
        {maxBet !== undefined && maxBet > 0 && (
          <span>Max: ${maxBet.toFixed(2)}</span>
        )}
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
