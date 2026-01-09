import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletGamingStatsProps {
  totalWinnings?: number;
  gamesPlayed?: number;
  winRate?: number;
  className?: string;
}

// Mock data for the mini chart (last 7 days)
const mockChartData = [
  { day: 'L', value: 50 },
  { day: 'M', value: 75 },
  { day: 'M', value: 30 },
  { day: 'J', value: 90 },
  { day: 'V', value: 60 },
  { day: 'S', value: 120 },
  { day: 'D', value: 85 },
];

export const WalletGamingStats: React.FC<WalletGamingStatsProps> = ({
  totalWinnings = 0,
  gamesPlayed = 0,
  winRate = 0,
  className
}) => {
  const maxValue = Math.max(...mockChartData.map(d => d.value), 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn("px-4 space-y-4", className)}>
      {/* Total Winnings Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-background rounded-2xl border border-amber-500/20 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Winnings</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalWinnings)}</p>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-16 flex items-end justify-between gap-1 mt-4">
          {mockChartData.map((data, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(data.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div 
                className="w-full rounded-t-sm bg-gradient-to-t from-amber-500/50 to-amber-400/80"
                style={{ height: '100%', minHeight: 4 }}
              />
              <span className="text-[9px] text-muted-foreground">{data.day}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/30 rounded-xl p-3 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-1">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Games Played</span>
          </div>
          <p className="text-xl font-bold text-foreground">{gamesPlayed}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-muted/30 rounded-xl p-3 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {winRate}%
            {winRate > 50 && (
              <TrendingUp className="w-4 h-4 text-emerald-500 inline ml-1" />
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
