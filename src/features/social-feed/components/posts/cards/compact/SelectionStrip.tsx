import React, { memo } from 'react';
import { Plus, Check, ArrowRight, Trophy, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelectionStripProps {
  marketType?: string;
  pick: string;
  odds: string;
  canBet?: boolean;
  isResolved?: boolean;
  isLost?: boolean;
  isWon?: boolean;
  inTicket?: boolean;
  onAddToTicket?: (e: React.MouseEvent) => void;
  onGoToMatch?: () => void;
  gameId?: string;
  showAddButton?: boolean;
  className?: string;
}

/**
 * Ultra-compact single-line selection display
 * Layout: [Pick • Market] ────── [Odds/Badge] [Match] [+]
 */
export const SelectionStrip = memo(function SelectionStrip({
  marketType,
  pick,
  odds,
  canBet = true,
  isResolved,
  isLost,
  isWon,
  inTicket,
  onAddToTicket,
  onGoToMatch,
  gameId,
  showAddButton = true,
  className
}: SelectionStripProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2.5",
        "border-l-[3px] transition-all duration-200",
        // State-based styling
        isWon && "border-l-emerald-500 bg-emerald-500/5",
        isLost && "border-l-red-500 bg-red-500/5 opacity-70",
        !isResolved && !isWon && !isLost && "border-l-primary/40 bg-muted/30",
        className
      )}
    >
      {/* Left: Market + Pick */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {marketType && (
          <span className="text-xs text-muted-foreground shrink-0">
            {marketType}
          </span>
        )}
        
        {marketType && <span className="text-muted-foreground/40 shrink-0">•</span>}
        
        <span className={cn(
          "text-sm font-bold truncate",
          isWon && "text-emerald-600 dark:text-emerald-400",
          isLost && "line-through text-muted-foreground",
          !isWon && !isLost && canBet && "text-foreground",
          !isWon && !isLost && !canBet && "text-muted-foreground"
        )}>
          {pick}
        </span>
      </div>
      
      {/* Right: Odds/Badge + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Odds or Result Badge */}
        {!isResolved && !isWon && !isLost && (
          <div className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums",
            canBet 
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted/50 text-muted-foreground"
          )}>
            {odds}
          </div>
        )}
        
        {isWon && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white">
            <Trophy className="h-3 w-3" />
            <span>WON</span>
          </div>
        )}
        
        {isLost && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-red-500/90 text-white">
            <XCircle className="h-3 w-3" />
            <span>LOST</span>
          </div>
        )}

        {/* Match button */}
        {gameId && onGoToMatch && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onGoToMatch();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium",
              "bg-muted/60 text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-colors duration-150"
            )}
          >
            <span>Match</span>
            <ArrowRight className="h-3 w-3" />
          </motion.button>
        )}
        
        {/* Add to ticket button */}
        {showAddButton && onAddToTicket && !isResolved && !isWon && !isLost && canBet && (
          <motion.button
            onClick={onAddToTicket}
            disabled={inTicket}
            whileHover={!inTicket ? { scale: 1.08, rotate: 90 } : {}}
            whileTap={!inTicket ? { scale: 0.95 } : {}}
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-lg transition-colors duration-150",
              inTicket 
                ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30 cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            )}
            aria-label={inTicket ? "Already in ticket" : "Add to ticket"}
          >
            {inTicket ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
});
