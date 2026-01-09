import { useState, useEffect } from 'react';

interface StageFilterProps {
  stages: string[];
  selectedStage: string;
  onStageChange: (stage: string) => void;
}

export function StageFilter({ stages, selectedStage, onStageChange }: StageFilterProps) {
  if (stages.length <= 1) return null;

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
      {stages.map(stage => (
        <button
          key={stage}
          onClick={() => onStageChange(stage)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors flex-shrink-0
            ${selectedStage === stage 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
        >
          {stage}
        </button>
      ))}
    </div>
  );
}
