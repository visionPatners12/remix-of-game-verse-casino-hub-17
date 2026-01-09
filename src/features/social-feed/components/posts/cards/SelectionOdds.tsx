import { useSelectionOdds } from '@azuro-org/sdk';
import { useSelectionState } from '../../../hooks/useSelectionState';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { cn } from '@/lib/utils';

interface SelectionOddsProps {
  selection: {
    conditionId?: string;
    outcomeId?: string;
    odds: number;
  };
}

export function SelectionOdds({ selection }: SelectionOddsProps) {
  const hasValidIds = !!(selection.conditionId && selection.outcomeId);
  
  const { data: dynamicOdds, isFetching } = useSelectionOdds({
    selection: hasValidIds ? {
      conditionId: selection.conditionId!,
      outcomeId: selection.outcomeId!
    } : {
      conditionId: '0',
      outcomeId: '0'
    }
  });
  
  const { canBet } = useSelectionState(selection.conditionId);
  
  const rawOdds = (hasValidIds && dynamicOdds) ? dynamicOdds : selection.odds;
  const { formattedOdds } = useOddsDisplay({ odds: rawOdds });
  
  return (
    <div className="flex items-center gap-1">
      <span className={cn(
        "text-lg font-bold",
        canBet ? "text-primary" : "text-muted-foreground line-through"
      )}>
        {formattedOdds}
      </span>
      {hasValidIds && isFetching && (
        <span className="text-sm animate-pulse">⟳</span>
      )}
    </div>
  );
}
