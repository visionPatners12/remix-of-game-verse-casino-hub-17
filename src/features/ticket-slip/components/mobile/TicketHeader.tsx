import React from 'react';
import { ModeSelector } from '../forms/ModeSelector';
import type { BetMode } from '../../types';

interface TicketHeaderProps {
  mode: BetMode;
  onChange: (mode: BetMode) => void;
  selectionsCount: number;
  canChangeToSystem: boolean;
}

export function TicketHeader({ mode, onChange, selectionsCount, canChangeToSystem }: TicketHeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-border/10">
      <ModeSelector
        mode={mode}
        onChange={onChange}
        selectionsCount={selectionsCount}
        canChangeToSystem={canChangeToSystem}
      />
    </div>
  );
}