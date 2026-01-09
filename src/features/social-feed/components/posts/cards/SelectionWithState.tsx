import React, { useState } from 'react';
import { Plus, Check, Calendar, Clock } from 'lucide-react';
import { formatAzuroDateSmart, formatAzuroTime, parseToAzuroTimestamp } from '@/utils/azuroDateFormatters';
import { useSelectionOdds } from '@azuro-org/sdk';
import { ConditionStateBadge } from '@/components/ui/condition-state-badge';
import { SelectionResultBadge } from '@/components/ui/selection-result-badge';
import { OptimizedTeamLogo } from '@/components/ui/optimized-team-logo';
import { SportIcon } from '@/components/ui/sport-icon';
import { useSelectionState } from '../../../hooks/useSelectionState';
import { useAddToTicket } from '@/hooks/useAddToTicket';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { FeedSelection } from '@/types/selection';
import type { FeedMatch } from '@/types/match';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

interface SelectionWithStateProps {
  selection: FeedSelection & {
    conditionId?: string;
    outcomeId?: string;
  };
  match: FeedMatch;
  showAddToTicket?: boolean;
  className?: string;
}

/**
 * Compact selection card with team logos, sport icons, and premium Won/Lost design
 */
export function SelectionWithState({ 
  selection, 
  match, 
  showAddToTicket = true,
  className
}: SelectionWithStateProps) {
  const { conditionState, stateInfo, canBet, isWon, isLost, isResolved } = useSelectionState(
    selection.conditionId,
    selection.outcomeId
  );
  
  const hasValidIds = !!(selection.conditionId && selection.outcomeId);
  const showResultBadge = isResolved && isWon !== null;
  
  // Integrate useAddToTicket hook
  const { addToTicket, isSelectionInTicket } = useAddToTicket();
  const { navigateFromAzuroGameId, navigateToMatchById } = useMatchNavigation();
  const inTicket = isSelectionInTicket({ 
    conditionId: selection.conditionId || '', 
    outcomeId: selection.outcomeId || '',
    odds: selection.odds
  });
  
  // Get gameId for navigation
  const gameId = selection.gameId || match.gameId;
  
  // Fetch live odds from Azuro SDK
  const { data: liveOdds } = useSelectionOdds({
    selection: hasValidIds ? {
      conditionId: selection.conditionId!,
      outcomeId: selection.outcomeId!
    } : undefined
  });
  
  // Use live odds if available, fallback to static
  const displayOdds = (hasValidIds && liveOdds) ? liveOdds : selection.odds;
  const { formattedOdds } = useOddsDisplay({ odds: displayOdds });
  
  const handleAddToTicket = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    addToTicket({
      selection: {
        conditionId: selection.conditionId!,
        outcomeId: selection.outcomeId!,
        odds: selection.odds,
        marketType: selection.marketType,
        pick: selection.pick
      },
      match: {
        ...match,
        gameId: selection.gameId || gameId,
        sport: selection.sport,
        participants: selection.participants
      }
    });
  };
  
  const handleCardClick = async () => {
    // First try match.id (Supabase UUID) if available
    if (match.id) {
      navigateToMatchById(match.id);
      return;
    }
    // Fallback to Azuro game ID lookup
    if (gameId) {
      await navigateFromAzuroGameId(gameId);
    }
  };
  
  // Extract team logos from participants
  const homeTeamImage = selection.participants?.[0]?.image;
  const awayTeamImage = selection.participants?.[1]?.image;
  
  // Extract sport slug from object or use as string
  const sportSlug = typeof selection.sport === 'object' ? selection.sport?.slug : selection.sport;
  
  // Track league logo load error for fallback
  const [logoError, setLogoError] = useState(false);
  const showLeagueLogo = selection.leagueLogo && !logoError;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className={cn(
        "bg-card/60 backdrop-blur-sm rounded-xl p-3.5 border relative transition-all duration-300 cursor-pointer",
        "hover:shadow-md hover:shadow-primary/5",
        !canBet && hasValidIds && !showResultBadge && "opacity-60 grayscale-[50%] border-muted/30",
        isWon && "border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-sm shadow-green-500/10",
        isLost && "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 opacity-75",
        !isWon && !isLost && "border-border/40 hover:border-border/60",
        className
      )}
    >
      {/* Won/Lost Badge - Absolute position top-right */}
      {showResultBadge ? (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="absolute -top-2 right-2 z-10"
        >
          <SelectionResultBadge isWon={isWon!} />
        </motion.div>
      ) : stateInfo && (
        <div className="absolute -top-2 right-2 z-10">
          <ConditionStateBadge state={conditionState} />
        </div>
      )}
      
      {/* Header: League logo (or sport icon as fallback) + League name + Date */}
      <div className="flex flex-col gap-1 mb-2.5">
        <div className="flex items-center gap-2">
          {showLeagueLogo ? (
            <img 
              src={selection.leagueLogo!} 
              alt={`${selection.league || 'League'} logo`}
              className="h-4 w-4 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <SportIcon slug={sportSlug} className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {selection.league || 'Unknown League'}
          </span>
        </div>
        
        {/* Match date and time */}
        {selection.startsAt && (() => {
          const timestamp = parseToAzuroTimestamp(selection.startsAt);
          if (!timestamp) return null;
          return (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatAzuroDateSmart(timestamp)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatAzuroTime(timestamp)}</span>
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Teams with logos */}
      {(selection.homeTeam || selection.awayTeam) && (
        <div 
          className="flex items-center justify-between mb-3 px-1"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {homeTeamImage && (
              <OptimizedTeamLogo 
                src={homeTeamImage}
                alt={`${selection.homeTeam || 'Home'} logo`}
                teamName={selection.homeTeam || 'Home'} 
                size="sm"
                className={cn(isLost && "grayscale", "transition-all duration-200")}
              />
            )}
            <span className={cn(
              "font-semibold text-sm truncate transition-all duration-200",
              isLost && "line-through opacity-60"
            )}>
              {selection.homeTeam || ''}
            </span>
          </div>
          
          <span className="text-[10px] text-muted-foreground/60 px-3 font-bold uppercase tracking-wide">vs</span>
          
          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
            <span className={cn(
              "font-semibold text-sm truncate transition-all duration-200",
              isLost && "line-through opacity-60"
            )}>
              {selection.awayTeam || ''}
            </span>
            {awayTeamImage && (
              <OptimizedTeamLogo 
                src={awayTeamImage}
                alt={`${selection.awayTeam || 'Away'} logo`}
                teamName={selection.awayTeam || 'Away'} 
                size="sm"
                className={cn(isLost && "grayscale", "transition-all duration-200")}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Market + Pick + Odds + Add button inline */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[11px] text-muted-foreground truncate">{selection.marketType}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className={cn(
            "text-sm font-bold truncate transition-colors duration-200",
            canBet && !isLost ? "text-primary" : "text-muted-foreground",
            isLost && "line-through"
          )}>
            {selection.pick}
          </span>
        </div>
        
        <div className="flex items-center gap-2.5">
          {!isResolved && (
            <motion.div 
              className={cn(
                "px-2.5 py-1 rounded-md font-bold text-sm transition-colors duration-200",
                canBet ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
              )}
              whileHover={canBet ? { scale: 1.05 } : {}}
            >
              {formattedOdds}
            </motion.div>
          )}
          
          {showAddToTicket && hasValidIds && !isResolved && canBet && (
            <motion.button 
              onClick={handleAddToTicket}
              disabled={inTicket}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                inTicket 
                  ? "bg-primary text-primary-foreground cursor-not-allowed"
                  : "bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary shadow-sm"
              )}
              aria-label={inTicket ? "Already in ticket" : "Add to ticket"}
            >
              {inTicket ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
