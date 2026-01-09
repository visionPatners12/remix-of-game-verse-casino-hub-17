import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useSelectionOdds } from '@azuro-org/sdk';
import { InlineMatchHeader } from './InlineMatchHeader';
import { CompactMatchDisplay } from './CompactMatchDisplay';
import { SelectionStrip } from './SelectionStrip';
import { useSelectionState } from '../../../../hooks/useSelectionState';
import { useAddToTicket } from '@/hooks/useAddToTicket';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { cn } from '@/lib/utils';
import type { FeedSelection } from '@/types/selection';
import type { FeedMatch } from '@/types/match';

interface CompactSelectionCardProps {
  selection: FeedSelection & {
    conditionId?: string;
    outcomeId?: string;
  };
  match: FeedMatch;
  showAddToTicket?: boolean;
  /** 'standalone' = default with borders, 'ticket-item' = no outer borders for ticket grouping */
  variant?: 'standalone' | 'ticket-item';
  className?: string;
}

/**
 * Ultra-compact betting slip card (~80px total height)
 * Combines InlineMatchHeader + CompactMatchDisplay + SelectionStrip
 */
export const CompactSelectionCard = memo(function CompactSelectionCard({
  selection,
  match,
  showAddToTicket = true,
  variant = 'standalone',
  className
}: CompactSelectionCardProps) {
  const { conditionState, canBet, isWon, isLost, isResolved } = useSelectionState(
    selection.conditionId,
    selection.outcomeId
  );
  
  const hasValidIds = !!(selection.conditionId && selection.outcomeId);
  
  const { addToTicket, isSelectionInTicket } = useAddToTicket();
  const { navigateFromAzuroGameId, navigateToMatchById } = useMatchNavigation();
  
  const inTicket = isSelectionInTicket({ 
    conditionId: selection.conditionId || '', 
    outcomeId: selection.outcomeId || '',
    odds: selection.odds
  });
  
  const gameId = selection.gameId || match.gameId;
  
  // Fetch live odds
  const { data: liveOdds } = useSelectionOdds({
    selection: hasValidIds ? {
      conditionId: selection.conditionId!,
      outcomeId: selection.outcomeId!
    } : undefined
  });
  
  const displayOdds = (hasValidIds && liveOdds) ? liveOdds : selection.odds;
  const { formattedOdds } = useOddsDisplay({ odds: displayOdds });
  
  const handleAddToTicket = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  
  const handleGoToMatch = async () => {
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
  
  const sportSlug = typeof selection.sport === 'object' ? selection.sport?.slug : selection.sport;
  const homeTeamImage = selection.participants?.[0]?.image;
  const awayTeamImage = selection.participants?.[1]?.image;
  
  const isTicketItem = variant === 'ticket-item';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "transition-all duration-200",
        isTicketItem 
          ? "bg-transparent" // No border/background in ticket mode
          : "rounded-xl border overflow-hidden bg-card/60 backdrop-blur-sm",
        !canBet && hasValidIds && !isResolved && "opacity-60 grayscale-[40%]",
        !isTicketItem && isWon && "border-green-500/40 shadow-sm shadow-green-500/10",
        !isTicketItem && isLost && "border-red-500/30 opacity-80",
        !isTicketItem && !isWon && !isLost && "border-border/40 hover:border-border/60 hover:shadow-sm",
        className
      )}
    >
      {/* Header: League + Date */}
      <InlineMatchHeader
        league={selection.league}
        leagueLogo={selection.leagueLogo}
        sportSlug={sportSlug}
        startsAt={selection.startsAt}
      />
      
      {/* Teams face-off */}
      <CompactMatchDisplay
        homeTeam={selection.homeTeam}
        awayTeam={selection.awayTeam}
        homeTeamLogo={homeTeamImage}
        awayTeamLogo={awayTeamImage}
        isLost={isLost}
        isWon={isWon}
      />
      
      {/* Selection strip: Market + Pick + Odds + Go to Match + Add */}
      <SelectionStrip
        marketType={selection.marketType}
        pick={selection.pick}
        odds={formattedOdds}
        canBet={canBet}
        isResolved={isResolved}
        isLost={isLost}
        isWon={isWon}
        inTicket={inTicket}
        onAddToTicket={hasValidIds ? handleAddToTicket : undefined}
        onGoToMatch={gameId ? handleGoToMatch : undefined}
        gameId={gameId}
        showAddButton={showAddToTicket && hasValidIds}
      />
    </motion.div>
  );
});
