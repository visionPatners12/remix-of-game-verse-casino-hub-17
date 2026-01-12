import React from 'react';
import { Trophy, Coins, Gamepad2 } from 'lucide-react';
import { cn } from '@/utils';

interface PrizePoolBadgeProps {
  betAmount: number;
  pot?: number | null;
  playersCount: number;
  className?: string;
}

export const PrizePoolBadge: React.FC<PrizePoolBadgeProps> = ({
  betAmount,
  pot,
  playersCount,
  className,
}) => {
  const isFreeGame = betAmount === 0;
  const displayPot = pot ?? betAmount * playersCount;

  if (isFreeGame) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
          "bg-muted/60 backdrop-blur-sm border border-border/50",
          "text-xs text-muted-foreground",
          className
        )}
      >
        <Gamepad2 className="w-3 h-3" />
        <span className="font-medium">Free Game</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
        "backdrop-blur-sm border border-amber-500/50",
        "text-xs font-semibold text-amber-400",
        "shadow-[0_0_10px_rgba(245,158,11,0.3)]",
        "animate-pulse",
        className
      )}
      style={{ animationDuration: '3s' }}
    >
      <Trophy className="w-3 h-3 text-amber-400" />
      <span className="font-orbitron tracking-wider">
        {displayPot} USDC
      </span>
    </div>
  );
};
