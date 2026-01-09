import React, { memo } from 'react';
import { TrendingUp, Lightbulb, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TicketWrapperProps {
  type: 'bet' | 'prediction';
  isParlay?: boolean;
  selectionsCount?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Premium ticket-style wrapper for bet/prediction posts
 * Minimal header with floating card effect
 */
export const TicketWrapper = memo(function TicketWrapper({
  type,
  isParlay,
  selectionsCount = 1,
  children,
  className
}: TicketWrapperProps) {
  const { t } = useTranslation('feed');
  
  const isBet = type === 'bet';
  
  const typeLabel = isParlay 
    ? t('ticket.parlay', 'Parlay') 
    : t('ticket.single', 'Single');

  return (
    <div 
      className={cn(
        "rounded-2xl overflow-hidden",
        "border shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        isBet 
          ? "border-primary/20 bg-gradient-to-b from-primary/3 to-transparent" 
          : "border-amber-500/20 bg-gradient-to-b from-amber-500/3 to-transparent",
        className
      )}
    >
      {/* Minimal Header */}
      <div 
        className={cn(
          "flex items-center justify-between px-3 py-2",
          "border-b",
          isBet 
            ? "border-primary/10 bg-primary/5" 
            : "border-amber-500/10 bg-amber-500/5"
        )}
      >
        {/* Left: Icon + Type */}
        <div className="flex items-center gap-1.5">
          {isBet ? (
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className={cn(
            "text-xs font-semibold",
            isBet ? "text-primary" : "text-amber-600 dark:text-amber-400"
          )}>
            {isBet ? t('ticket.bet', 'Bet') : t('ticket.prediction', 'Prono')}
          </span>
        </div>
        
        {/* Right: Parlay/Single badge */}
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
          isBet 
            ? "bg-primary/10 text-primary" 
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        )}>
          {isParlay && <Layers className="h-2.5 w-2.5" />}
          <span>{typeLabel}</span>
          {isParlay && selectionsCount > 1 && (
            <span className="opacity-60">({selectionsCount})</span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="divide-y divide-border/30">
        {children}
      </div>
    </div>
  );
});
