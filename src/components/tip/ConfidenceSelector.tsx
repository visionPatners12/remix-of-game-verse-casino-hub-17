import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { getConfidenceLevel } from '@/types/tip';

interface ConfidenceSelectorProps {
  confidence: number;
  onChange: (confidence: number) => void;
  className?: string;
}

export const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({
  confidence,
  onChange,
  className = ""
}) => {
  const confidenceData = getConfidenceLevel(confidence);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Confidence</Label>
        <span className={`text-sm font-medium ${confidenceData.color}`}>
          {confidence}%
        </span>
      </div>
      
      <Slider
        value={[confidence]}
        onValueChange={(values) => onChange(values[0])}
        max={100}
        min={0}
        step={5}
        className="w-full"
      />
    </div>
  );
};