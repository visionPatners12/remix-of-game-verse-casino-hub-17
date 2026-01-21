import React from 'react';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { BRACKET_CONFIGS } from '../types';

interface BracketSizeSelectorProps {
  value: 4 | 8 | 16 | 32;
  onChange: (size: 4 | 8 | 16 | 32) => void;
}

const SIZES: (4 | 8 | 16 | 32)[] = [4, 8, 16, 32];

export const BracketSizeSelector = ({ value, onChange }: BracketSizeSelectorProps) => {
  const config = BRACKET_CONFIGS[value];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Bracket Size</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {SIZES.map((size) => {
          const isSelected = value === size;
          const sizeConfig = BRACKET_CONFIGS[size];
          
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200",
                "border-2",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "border-border/30 bg-muted/20 hover:border-border/50 hover:bg-muted/30"
              )}
            >
              <span className={cn(
                "text-2xl font-bold",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {size}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                players
              </span>
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg py-2 px-4">
        <span className="font-medium text-foreground">{config.rounds} rounds</span>
        <span>•</span>
        <span>Single elimination</span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {config.roundNames.map((name, idx) => (
          <span 
            key={name}
            className={cn(
              "text-xs px-2 py-1 rounded-full",
              idx === config.roundNames.length - 1 
                ? "bg-primary/20 text-primary font-medium"
                : "bg-muted/30 text-muted-foreground"
            )}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};
