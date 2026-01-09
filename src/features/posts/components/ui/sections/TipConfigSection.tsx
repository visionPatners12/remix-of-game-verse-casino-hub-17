import React from 'react';
import { ToggleSwitch } from '@/features/live/components/forms';

interface TipConfigSectionProps {
  isPremiumTip: boolean;
  tipVisibility: string;
  hasTipsterProfile: boolean;
  onTogglePremiumTip: (value: boolean) => void;
  onToggleVisibility: (value: boolean) => void;
}

export function TipConfigSection({ 
  isPremiumTip, 
  tipVisibility,
  hasTipsterProfile,
  onTogglePremiumTip,
  onToggleVisibility 
}: TipConfigSectionProps) {
  if (!hasTipsterProfile) return null;

  return (
    <>
      {/* Switch to enable premium tip mode */}
      <div className="mb-6">
        <ToggleSwitch
          label="Premium tip mode"
          checked={isPremiumTip}
          onChange={onTogglePremiumTip}
          trueLabel="Premium tip"
          falseLabel="Standard prediction"
        />
      </div>

      {/* Visibility switch for premium tips */}
      {isPremiumTip && (
        <div className="mb-6">
          <ToggleSwitch
            label="Premium tip visibility"
            checked={tipVisibility === 'public'}
            onChange={(checked) => onToggleVisibility(checked)}
            trueLabel="Public"
            falseLabel="Subscribers only"
          />
        </div>
      )}
    </>
  );
}