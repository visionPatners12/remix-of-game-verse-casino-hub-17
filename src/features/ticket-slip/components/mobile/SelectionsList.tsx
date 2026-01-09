import React from 'react';
import { SimpleSelectionCard } from '../cards/SimpleSelectionCard';

interface SelectionsListProps {
  selections: any[];
  onRemove: (selection: any) => void;
  onEventClick: (gameId: string) => void;
  isStatesFetching: boolean;
  states: any;
}

export function SelectionsList({ 
  selections, 
  onRemove, 
  onEventClick, 
  isStatesFetching, 
  states 
}: SelectionsListProps) {
  return (
    <div className="divide-y divide-border/10">
      {selections.map((selection, index) => (
        <SimpleSelectionCard
          key={`${selection.conditionId}-${selection.outcomeId}`}
          selection={selection}
          onRemove={onRemove}
          onEventClick={onEventClick}
          isStatesFetching={isStatesFetching}
          states={states}
        />
      ))}
    </div>
  );
}