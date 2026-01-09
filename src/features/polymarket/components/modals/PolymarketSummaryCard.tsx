import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOddsFormat } from '@/contexts/OddsFormatContext';
import { convertOdds } from '@/utils/oddsCalculators';

interface PolymarketSummaryCardProps {
  decimalOdds: number;
  payout: number;
  profit: number;
  profitPercent: number;
  outcome: 'YES' | 'NO' | string;
  className?: string;
}

function useCounterAnimation(value: number, duration: number = 500) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const diff = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(startValue + diff * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
}

export function PolymarketSummaryCard({ 
  decimalOdds,
  payout, 
  profit,
  profitPercent,
  className 
}: PolymarketSummaryCardProps) {
  const { format } = useOddsFormat();
  const animatedPayout = useCounterAnimation(payout);
  
  const formattedOdds = decimalOdds > 0 ? convertOdds(decimalOdds, format) : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-card/60 backdrop-blur-sm border border-border/30",
        className
      )}
    >
      <div className="relative px-4 py-4">
        {/* Main payout display */}
        <div className="text-center mb-3">
          <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
          <div className="flex items-center justify-center gap-2">
            <motion.span 
              key={payout}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-accent"
            >
              ${animatedPayout.toFixed(2)}
            </motion.span>
            {profitPercent > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                +{profitPercent.toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm border-t border-border/30 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Odds</span>
            <span className="font-semibold text-foreground tabular-nums">{formattedOdds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Profit</span>
            <span className="font-semibold text-accent tabular-nums">
              +${profit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
