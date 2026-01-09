import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassSummaryCardProps {
  totalOdds: number;
  potentialWin: number;
  stake: number;
  currency?: string;
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

export function GlassSummaryCard({ 
  totalOdds, 
  potentialWin, 
  stake, 
  currency = 'USDT',
  className 
}: GlassSummaryCardProps) {
  const animatedWin = useCounterAnimation(potentialWin);
  const animatedOdds = useCounterAnimation(totalOdds);
  const profit = potentialWin - stake;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-lg overflow-hidden",
        "bg-card/60 backdrop-blur-sm",
        className
      )}
    >
      <div className="relative px-3 py-2 flex items-center justify-between">
        {/* Left: Odds */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Odds</span>
          <span className="text-sm font-bold text-foreground">
            {animatedOdds.toFixed(2)}
          </span>
        </div>

        {/* Right: Potential Win */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Win</span>
          <motion.span 
            key={potentialWin}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-success"
          >
            ${animatedWin.toFixed(2)}
          </motion.span>
          {profit > 0 && (
            <span className="text-xs text-success/80">
              +{((profit / stake) * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}