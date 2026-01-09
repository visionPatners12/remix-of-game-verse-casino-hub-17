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