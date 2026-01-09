import React, { memo, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { BasePost } from '../base/BasePost';
import type { BasePostProps } from '../base/BasePostProps';
import { CompactSelectionCard, BettingStatsBar, TicketWrapper } from './compact';
import { labelOf } from '@/utils/labels';
import { useValidatedSelections } from '../../../hooks/useValidatedSelections';
import { useLiveCombinedOdds } from '../../../hooks/useLiveCombinedOdds';
import { useAnySelectionResolved } from '../../../hooks/useAnySelectionResolved';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { logger } from '@/utils/logger';

/**
 * Tip/prediction post card - Premium compact design with ticket appearance
 */
export const TipPostCard = memo(function TipPostCard(props: BasePostProps) {
  const { post } = props;
  const prediction = post.prediction;

  const rawSelections = useMemo(
    () => prediction?.selections || (prediction?.selection ? [prediction.selection] : []),
    [prediction?.selections, prediction?.selection]
  );
  
  const validSelections = useValidatedSelections(rawSelections, `TipPost:${post.id}`);
  const { combinedOdds, isFetching } = useLiveCombinedOdds(validSelections);
  
  const conditionIds = useMemo(
    () => validSelections.map(sel => sel.conditionId).filter(Boolean) as string[],
    [validSelections]
  );
  const { hasAnyResolved } = useAnySelectionResolved(conditionIds);
  const { formattedOdds: formattedCombinedOdds } = useOddsDisplay({ odds: combinedOdds });

  if (!prediction) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  if (validSelections.length === 0) {
    logger.error('[TipPost] No valid selections found for post:', post.id);
    return (
      <BasePost {...props}>
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/50">
          <div className="text-sm text-destructive">❌ Invalid selection data</div>
        </div>
      </BasePost>
    );
  }

  const { match, confidence, analysis, isPremium } = prediction;
  const { homeName, awayName, league } = match;
  const isParlay = validSelections.length > 1;
  
  // Avoid showing duplicate content when post.content equals analysis
  const contentIsAnalysis = post.content?.trim() === analysis?.trim();

  return (
    <BasePost {...props}>
      {/* Premium badge - shown above ticket */}
      {isPremium && (
        <div className="flex items-center gap-2 pb-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium">
            <Lock className="h-3 w-3" />
            Premium
          </span>
        </div>
      )}
      
      {/* Content with post text - only show if different from analysis */}
      {post.content && !contentIsAnalysis && (
        <p className="text-sm text-foreground/90 leading-relaxed pb-2">
          {post.content}
        </p>
      )}
      
      {/* Ticket wrapper with selections */}
      <TicketWrapper 
        type="prediction" 
        isParlay={isParlay}
        selectionsCount={validSelections.length}
      >
        {/* Compact selection cards */}
        {validSelections.map((sel, idx) => (
          <CompactSelectionCard
            key={idx}
            selection={{
              ...sel,
              league: validSelections.length === 1 
                ? labelOf(league, 'Unknown League') 
                : labelOf(sel.league ?? league, 'Unknown League'),
              matchName: validSelections.length === 1 
                ? `${homeName} vs ${awayName}` 
                : (sel.matchName || `${homeName} vs ${awayName}`)
            }}
            match={prediction.match}
            showAddToTicket={true}
            variant="ticket-item"
          />
        ))}

        {/* Stats bar with confidence & analysis */}
        {!hasAnyResolved && (
          <BettingStatsBar
            totalOdds={formattedCombinedOdds}
            confidence={confidence}
            analysis={analysis}
            isFetching={isFetching}
            isParlay={isParlay}
          />
        )}
      </TicketWrapper>
    </BasePost>
  );
});
