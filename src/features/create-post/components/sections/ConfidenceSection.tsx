/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React from 'react';
import { ConfidenceSelector } from '@/components/tip/ConfidenceSelector';

interface ConfidenceSectionProps {
  confidence: number;
  onChange: (confidence: number) => void;
}

export function ConfidenceSection({ confidence, onChange }: ConfidenceSectionProps) {
  return (
    <div className="mb-6">
      <ConfidenceSelector
        confidence={confidence}
        onChange={onChange}
      />
    </div>
  );
}