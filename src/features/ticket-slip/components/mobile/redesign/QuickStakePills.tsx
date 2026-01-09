import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickStakePillsProps {
  currentStake: number;
  onSelect: (amount: number) => void;
  maxBet?: number;
  className?: string;
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

export function QuickStakePills({ 
  currentStake, 
  onSelect, 
  maxBet,
  className 
}: QuickStakePillsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 hide-scrollbar", className)}>
      {QUICK_AMOUNTS.map((amount, index) => {
        const isSelected = currentStake === amount;
        const isDisabled = maxBet !== undefined && amount > maxBet;

        return (
          <motion.button
            key={amount}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isDisabled && onSelect(amount)}
            disabled={isDisabled}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold",
              "transition-all duration-200",
              "border",
              isSelected 
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25" 
                : "bg-muted/30 text-foreground border-border/50 hover:border-primary/50 hover:bg-muted/50",
              isDisabled && "opacity-40 cursor-not-allowed"
            )}
          >
            ${amount}
          </motion.button>
        );
      })}

    </div>
  );
}
