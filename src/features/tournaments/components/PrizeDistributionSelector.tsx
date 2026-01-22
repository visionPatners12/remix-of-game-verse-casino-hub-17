import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import { PrizeDistributionType, PRIZE_DISTRIBUTIONS } from '../types';

interface PrizeDistributionSelectorProps {
  value: PrizeDistributionType;
  onChange: (value: PrizeDistributionType) => void;
}

const DISTRIBUTION_TYPES: PrizeDistributionType[] = ['standard', 'winner-takes-all', 'top-heavy', 'balanced'];

export const PrizeDistributionSelector = ({ value, onChange }: PrizeDistributionSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Trophy className="h-4 w-4" />
        <span>Prize Distribution</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DISTRIBUTION_TYPES.map((type) => {
          const config = PRIZE_DISTRIBUTIONS[type];
          const isSelected = value === type;
          
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                "relative p-3 rounded-xl text-left transition-all duration-200",
                "border-2",
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-transparent bg-muted/30 hover:bg-muted/50"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{config.emoji}</span>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {config.name}
                </span>
              </div>

              {/* Distribution bars */}
              <div className="space-y-1">
                {config.distribution.slice(0, 3).map((prize, idx) => (
                  <div key={prize.position} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-4">
                      {prize.position}
                    </span>
                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          isSelected ? "bg-primary" : "bg-muted-foreground/50",
                          idx === 0 && "opacity-100",
                          idx === 1 && "opacity-70",
                          idx === 2 && "opacity-50"
                        )}
                        style={{ width: `${prize.percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">
                      {prize.percentage}%
                    </span>
                  </div>
                ))}
                {config.distribution.length > 3 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    +{config.distribution.length - 3} more
                  </div>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
