import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOddsFormat } from '@/contexts/OddsFormatContext';
import { convertOdds } from '@/utils/oddsCalculators';

interface PolymarketSelectionCardProps {
  outcome: 'YES' | 'NO' | string;
  decimalOdds: number; // Raw decimal odds for conversion
  probability?: number; // 0-100 range
}

export function PolymarketSelectionCard({ 
  outcome, 
  decimalOdds,
  probability,
}: PolymarketSelectionCardProps) {
  const { format } = useOddsFormat();
  const isYes = outcome.toUpperCase() === 'YES';
  
  // Format odds according to user preference
  const formattedOdds = decimalOdds > 0 ? convertOdds(decimalOdds, format) : '—';
  const displayProbability = probability ?? (decimalOdds > 0 ? (1 / decimalOdds) * 100 : 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          'relative rounded-xl p-4 flex items-center justify-between overflow-hidden',
          'border transition-all duration-200',
          isYes 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-rose-500/10 border-rose-500/30'
        )}
      >
        {/* Left: Outcome label with icon */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
            isYes 
              ? 'bg-emerald-500 text-white' 
              : 'bg-rose-500 text-white'
          )}>
            {isYes ? '✓' : '✗'}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-base font-semibold",
              isYes ? "text-emerald-500" : "text-rose-500"
            )}>
              {outcome.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              {displayProbability.toFixed(0)}% chance
            </span>
          </div>
        </div>

        {/* Right: Odds display */}
        <motion.div 
          key={formattedOdds}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-end"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {format === 'american' ? 'American' : format === 'fractional' ? 'Fractional' : 'Odds'}
          </span>
          <span className={cn(
            "text-xl font-bold tabular-nums",
            isYes ? "text-emerald-500" : "text-rose-500"
          )}>
            {formattedOdds}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
