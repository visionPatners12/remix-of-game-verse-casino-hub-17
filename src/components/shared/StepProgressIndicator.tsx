
import React from 'react';

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const StepProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: StepProgressIndicatorProps) => {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Étape {currentStep} sur {totalSteps}
        </span>
        {stepLabels && stepLabels[currentStep - 1] && (
          <span className="text-sm font-medium">
            {stepLabels[currentStep - 1]}
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};
