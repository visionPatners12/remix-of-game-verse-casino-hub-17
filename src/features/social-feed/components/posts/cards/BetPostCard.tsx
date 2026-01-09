import React, { memo, useMemo } from 'react';
import { BasePost } from '../base/BasePost';
import type { BasePostProps } from '../base/BasePostProps';
import { CompactSelectionCard, BettingStatsBar, TicketWrapper } from './compact';
import { useValidatedSelections } from '../../../hooks/useValidatedSelections';
import { useLiveCombinedOdds } from '../../../hooks/useLiveCombinedOdds';
import { useAnySelectionResolved } from '../../../hooks/useAnySelectionResolved';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

/**
 * Bet post card - Premium compact design with ticket appearance
 */
export const BetPostCard = memo(function BetPostCard(props: BasePostProps) {
  const { post } = props;
  const bet = post.bet;

  const selections = useMemo(() => bet?.selections || [], [bet?.selections]);
  const validSelections = useValidatedSelections(selections, `BetPost:${post.id}`);
  const { combinedOdds: totalOdds, isFetching } = useLiveCombinedOdds(validSelections);
  
  const conditionIds = useMemo(
    () => validSelections.map(sel => sel.conditionId).filter(Boolean) as string[],
    [validSelections]
  );
  const { hasAnyResolved } = useAnySelectionResolved(conditionIds);
  const { formattedOdds } = useOddsDisplay({ odds: totalOdds });

  if (!bet || selections.length === 0) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  if (validSelections.length === 0) {
    return (
      <BasePost {...props}>
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/50">
          <p className="text-destructive text-sm font-medium">❌ Invalid data</p>
        </div>
      </BasePost>
    );
  }
  
  const { betAmount = 0, currency = 'USDT' } = bet;
  const potentialWin = betAmount * totalOdds - betAmount;
  const isParlay = validSelections.length > 1;

  return (
    <BasePost {...props}>
      {/* Content with post text */}
      {post.content && (
        <p className="text-sm text-foreground/90 leading-relaxed pb-2">
          {post.content}
        </p>
      )}

      {/* Ticket wrapper with selections */}
      <TicketWrapper 
        type="bet" 
        isParlay={isParlay}
        selectionsCount={validSelections.length}
      >
        {/* Compact selection cards */}
        {validSelections.map((sel, idx) => (
          <CompactSelectionCard
            key={idx}
            selection={sel}
            match={{ homeName: sel.homeTeam, awayName: sel.awayTeam, league: sel.league }}
            showAddToTicket={true}
            variant="ticket-item"
          />
        ))}

        {/* Stats bar with stake, odds, potential win */}
        {validSelections.length > 0 && betAmount > 0 && !hasAnyResolved && (
          <BettingStatsBar
            stake={betAmount}
            currency={currency}
            totalOdds={formattedOdds}
            potentialWin={potentialWin}
            isFetching={isFetching}
            isParlay={isParlay}
          />
        )}
      </TicketWrapper>
    </BasePost>
  );
});
