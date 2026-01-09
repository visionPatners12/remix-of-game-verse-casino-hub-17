import React from 'react';
import { CircularGaugeProps } from '../../types/ui';

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  percentage,
  size = 46,
  strokeWidth = 4
}) => {
  // Validate and clamp percentage to avoid NaN
  const safePercentage = isNaN(percentage) || !isFinite(percentage) 
    ? 50 
    : Math.min(100, Math.max(0, percentage));
    
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-smooth"
        />
      </svg>
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-caption font-medium text-foreground">
          {Math.round(safePercentage)}%
        </span>
      </div>
    </div>
  );
};