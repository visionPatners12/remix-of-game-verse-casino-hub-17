import React from 'react';
import { useBaseBetslip } from '@azuro-org/sdk';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import { SimpleSelectionCard } from '@/features/ticket-slip/components/cards/SimpleSelectionCard';
import { Separator } from '@/components/ui/separator';

interface TicketSelectionsDisplayProps {
  showConfidence?: boolean;
  confidence?: number;
  onConfidenceChange?: (value: number) => void;
}

export function TicketSelectionsDisplay({ 
  showConfidence = false, 
  confidence = 50, 
  onConfidenceChange 
}: TicketSelectionsDisplayProps) {
  const { items, removeItem } = useBaseBetslip();
  const { navigateFromAzuroGameId } = useMatchNavigation();

  if (!items || items.length === 0) {
    return (
      <div className="-mx-4 px-4 py-6 border-y border-border/40 bg-muted/10">
        <p className="text-sm text-muted-foreground text-center">
          No selections in your ticket
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-4 border-y border-border/40">
      {items.map((item, index) => (
        <React.Fragment key={`${item.gameId}-${item.conditionId}-${item.outcomeId}`}>
          {index > 0 && <Separator />}
          <div className="px-4 py-3">
            <SimpleSelectionCard
              selection={item}
              onRemove={() => removeItem(item)}
              onEventClick={() => navigateFromAzuroGameId(item.gameId)}
            />
          </div>
        </React.Fragment>
      ))}
      
      {showConfidence && onConfidenceChange && (
        <>
          <Separator />
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Confidence</span>
              <span className="text-sm font-medium text-primary">{confidence}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={confidence}
              onChange={(e) => onConfidenceChange(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </>
      )}
    </div>
  );
}
