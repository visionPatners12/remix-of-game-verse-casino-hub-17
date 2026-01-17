/**
 * Pot Widget - Premium prize badge with shine animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TokenUSDC, NetworkBase } from '@web3icons/react';
import { Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PotWidgetProps {
  amount: number;
  betAmount?: number;
  className?: string;
}

export const PotWidget: React.FC<PotWidgetProps> = ({
  amount,
  betAmount,
  className,
}) => {
  // Use betAmount to determine if it's a free game (bet_amount = 0 means free)
  const isFreeGame = betAmount !== undefined ? betAmount <= 0 : amount === 0;

  if (isFreeGame) {
    return (
      <motion.div 
        className={cn(
          "relative flex flex-col items-center gap-1 pointer-events-auto",
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">Free</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={cn(
        "relative flex flex-col items-center gap-1 pointer-events-auto",
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Main pot container */}
      <div className="relative overflow-hidden rounded-xl bg-black/60 backdrop-blur-xl border border-amber-500/30">
        {/* Shine effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex items-center gap-2 px-3 py-2">
          {/* Trophy icon */}
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-yellow-600/30">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>

          {/* Amount with icons */}
          <div className="flex items-center gap-1.5">
            <TokenUSDC variant="branded" className="w-4 h-4" />
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              {amount.toFixed(2)}
            </span>
          </div>

          {/* Network badge */}
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5">
            <NetworkBase className="w-3.5 h-3.5 opacity-70" />
          </div>
        </div>
      </div>

      {/* Label */}
      <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider">
        Prize Pool
      </span>
    </motion.div>
  );
};

export default PotWidget;
