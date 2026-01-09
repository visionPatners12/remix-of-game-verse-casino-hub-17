import React from 'react';
import type { BetMode } from '../../types';

interface ModeSelectorProps {
  mode: BetMode;
  onChange: (mode: BetMode) => void;
  selectionsCount: number;
  canChangeToSystem: boolean;
}

export function ModeSelector({ mode, onChange, selectionsCount, canChangeToSystem }: ModeSelectorProps) {
  const modes: { value: BetMode; label: string }[] = [
    { value: 'REGULAR', label: 'REGULAR' },
    { value: 'AGAINST_PLAYER', label: 'AGAINSTPLAYER' }
  ];

  return (
    <div className="flex items-center gap-1 h-9">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`flex-1 h-full rounded-md text-xs font-medium transition-all ${
            mode === m.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          style={{ minWidth: '24px', minHeight: '32px' }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}