import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OddsBadgeProps {
  odds: string;
  previousOdds?: number;
  currentOdds?: number;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OddsBadge({ 
  odds, 
  previousOdds, 
  currentOdds, 
  isLoading = false,
  size = 'md',
  className 
}: OddsBadgeProps) {
  const trend = previousOdds && currentOdds 
    ? currentOdds > previousOdds ? 'up' : currentOdds < previousOdds ? 'down' : null 
    : null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-lg font-bold",
        "bg-primary/10 text-primary border border-primary/20",
        "backdrop-blur-sm",
        sizeClasses[size],
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={odds}
          initial={{ y: trend === 'up' ? 10 : trend === 'down' ? -10 : 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: trend === 'up' ? -10 : trend === 'down' ? 10 : 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {odds}
        </motion.span>
      </AnimatePresence>

      {trend && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "flex items-center",
            trend === 'up' ? 'text-success' : 'text-destructive'
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
        </motion.div>
      )}

      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full"
        />
      )}
    </motion.div>
  );
}
