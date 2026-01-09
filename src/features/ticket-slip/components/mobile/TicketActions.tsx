import React from 'react';
import { PrimaryCTA, ShareButton } from '../actions';
import type { BetMode, Currency } from '../../types';

interface TicketActionsProps {
  canSubmit: boolean;
  selectionsCount: number;
  mode: BetMode;
  isSubmitting: boolean;
  onSubmit: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  selections: any[];
  totalOdds: number;
  stake: number;
  potentialWin: number;
}

export function TicketActions({
  canSubmit,
  selectionsCount,
  mode,
  isSubmitting,
  onSubmit,
  onPublish,
  isPublishing,
  selections,
  totalOdds,
  stake,
  potentialWin
}: TicketActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/10 p-4 z-50">
      <div className="space-y-3">
        <PrimaryCTA
          canSubmit={canSubmit}
          selectionsCount={selectionsCount}
          mode={mode}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onPublish={onPublish}
          isPublishing={isPublishing}
        />

        <ShareButton
          selections={selections as any}
          totalOdds={totalOdds}
          stake={stake}
          potentialWin={potentialWin}
        />
      </div>
    </div>
  );
}