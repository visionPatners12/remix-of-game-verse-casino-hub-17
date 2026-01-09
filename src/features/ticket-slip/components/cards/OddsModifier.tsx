import React from 'react';
import { OddsButton } from '@/shared/ui/buttons';

interface OddsModifierProps {
  originalOdds: number;
  customOdds?: number;
  onChange: (odds: number) => void;
  disabled?: boolean;
}

export function OddsModifier({ originalOdds, customOdds, onChange, disabled }: OddsModifierProps) {
  return (
    <div className="mt-1">
      <OddsButton
        variant="custom"
        label="Odds"
        odds={customOdds || originalOdds}
        originalOdds={originalOdds}
        customOdds={customOdds}
        onChange={onChange}
        disabled={disabled}
        showModifier={true}
        minOdds={1.01}
        maxOdds={50}
      />
    </div>
  );
}