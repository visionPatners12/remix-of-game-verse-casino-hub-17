import React, { memo } from 'react';
import { Coins, TrendingUp, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BettingStatsBarProps {
  stake?: number;
  currency?: string;
  totalOdds: string;
  potentialWin?: number;
  confidence?: number;
  analysis?: string;
  isFetching?: boolean;
  isParlay?: boolean;
  className?: string;
}

/**
 * Compact inline stats bar for betting posts
 * Layout: [💰 Stake] | [@Odds] | [→ Win] | [🎯 Confidence]
 */
export const BettingStatsBar = memo(function BettingStatsBar({
  stake,
  currency = 'USDT',
  totalOdds,
  potentialWin,
  confidence,
  analysis,
  isFetching,
  isParlay,
  className
}: BettingStatsBarProps) {
  // Confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-500';
    if (conf >= 60) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <div className={cn("px-3 py-2.5 bg-muted/20 border-t border-border/30", className)}>
      {/* Analysis section - if provided */}
      {analysis && (
        <div className="flex items-start gap-2 mb-2 pb-2 border-b border-border/20">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {analysis}
          </p>
        </div>
      )}
      
      {/* Stats row - single line */}
      <div className="flex items-center justify-between gap-2">
        {/* Left group: Stake + Odds + Win */}
        <div className="flex items-center gap-3">
          {/* Stake */}
          {stake !== undefined && stake > 0 && (
            <div className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-bold tabular-nums">
                {stake.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">{currency}</span>
              </span>
            </div>
          )}
          
          {/* Separator */}
          {stake !== undefined && stake > 0 && <div className="w-px h-4 bg-border/50" />}
          
          {/* Total Odds */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">@</span>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              isParlay && "text-primary",
              isFetching && "opacity-50"
            )}>
              {isFetching ? '...' : totalOdds}
            </span>
          </div>
          
          {/* Separator */}
          {potentialWin !== undefined && potentialWin > 0 && <div className="w-px h-4 bg-border/50" />}
          
          {/* Potential Win */}
          {potentialWin !== undefined && potentialWin > 0 && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{potentialWin.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        {/* Right: Confidence badge */}
        {confidence !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full",
            "bg-muted/50"
          )}>
            <Target className={cn("h-3 w-3", getConfidenceColor(confidence))} />
            <span className={cn(
              "text-xs font-bold tabular-nums",
              getConfidenceColor(confidence)
            )}>
              {confidence}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
