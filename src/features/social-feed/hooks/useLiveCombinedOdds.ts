import { useOdds } from '@azuro-org/sdk';
import type { Selection } from '@azuro-org/toolkit';
import { useMemo } from 'react';
import type { OddsSelection } from '@/types/selection';

/**
 * Fetches live combined odds from Azuro for multiple selections
 * Falls back to static calculation if no valid Azuro IDs
 */
export function useLiveCombinedOdds(selections: OddsSelection[]) {
  // Filter selections with valid Azuro IDs
  const validSelections: Selection[] = useMemo(() => 
    selections
      .filter(sel => sel.conditionId && sel.outcomeId)
      .map(sel => ({
        conditionId: sel.conditionId!,
        outcomeId: sel.outcomeId!
      })),
    [selections]
  );

  // Fetch live odds from Azuro
  const { data, isFetching } = useOdds({
    selections: validSelections.length > 0 ? validSelections : undefined
  });

  // Fallback to static calculation if no valid Azuro IDs
  const fallbackOdds = useMemo(() => 
    selections.reduce((acc, sel) => acc * (sel.odds || 1), 1),
    [selections]
  );

  return {
    combinedOdds: data?.totalOdds || fallbackOdds,
    individualOdds: data?.odds || {},
    isFetching,
    isLive: validSelections.length > 0 && !!data?.totalOdds
  };
}
