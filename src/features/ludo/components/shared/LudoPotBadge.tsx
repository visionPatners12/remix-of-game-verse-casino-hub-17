/**
 * Stylish Pot Display Badge with USDC and Base Network icons
 */

import React from 'react';
import { TokenUSDC, NetworkBase } from '@web3icons/react';
import { Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LudoPotBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showTrophy?: boolean;
  variant?: 'default' | 'glow' | 'minimal';
  isFreeGame?: boolean;
  className?: string;
}

export const LudoPotBadge: React.FC<LudoPotBadgeProps> = ({
  amount,
  size = 'md',
  showTrophy = true,
  variant = 'default',
  isFreeGame = false,
  className,
}) => {

  if (isFreeGame) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full",
        "bg-emerald-500/20 border border-emerald-500/30",
        className
      )}>
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">Free Game</span>
      </div>
    );
  }

  const sizeStyles = {
    sm: {
      container: 'px-2.5 py-1 gap-1',
      icon: 'h-3.5 w-3.5',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 gap-1.5',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 gap-2',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  const variantStyles = {
    default: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30',
    glow: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    minimal: 'bg-muted/50 border border-border/50',
  };

  const { container, icon, text } = sizeStyles[size];

  return (
    <div className={cn(
      "flex items-center rounded-full transition-all",
      container,
      variantStyles[variant],
      className
    )}>
      {showTrophy && (
        <Trophy className={cn(icon, "text-amber-400")} />
      )}
      <TokenUSDC variant="branded" className={icon} />
      <span className={cn(text, "font-bold text-amber-400 tabular-nums")}>
        {amount.toFixed(2)}
      </span>
      <NetworkBase className={cn(icon, "opacity-70")} />
    </div>
  );
};

export default LudoPotBadge;
