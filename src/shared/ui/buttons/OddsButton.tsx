// ===== UNIFIED ODDS BUTTON COMPONENT =====

import React, { useMemo } from 'react';
import { Button, Input } from '@/ui';
import { Triangle, Plus, Minus, Loader2 } from 'lucide-react';
import { useSelectionOdds } from '@azuro-org/sdk';
import { cn } from '@/lib/utils';


// Import shared hooks
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { useOddsAnimation } from '@/shared/hooks/useOddsAnimation';
import { useOddsSelection } from '@/shared/hooks/useOddsSelection';

// Import types
import type { 
  OddsButtonProps, 
  SportOddsButtonProps, 
  PredictionOddsButtonProps, 
  CustomOddsButtonProps,
  AnimationType 
} from './types';

export const OddsButton: React.FC<OddsButtonProps> = (props) => {
  // Route to specific variant implementation
  switch (props.variant) {
    case 'sport':
      return <SportOddsButton {...(props as SportOddsButtonProps)} />;
    case 'prediction':
      return <PredictionOddsButton {...(props as PredictionOddsButtonProps)} />;
    case 'custom':
      return <CustomOddsButton {...(props as CustomOddsButtonProps)} />;
    default:
      return null;
  }
};

// ===== SPORT VARIANT (Azuro/Sports Betting) =====
const SportOddsButton: React.FC<SportOddsButtonProps> = ({
  outcome,
  teamType,
  label,
  odds,
  onSelect,
  disabled = false,
  className,
  realTimeOdds = true,
  gameId,
  eventName,
  marketType,
  participants,
  sport,
  league,
  startsAt,
  format
}) => {
  // Get real-time odds if enabled
  const { data: currentOdds, isFetching } = useSelectionOdds({
    selection: outcome,
    initialOdds: odds
  });

  const finalOdds = currentOdds || odds;

  // Use shared hooks
  const { formattedOdds } = useOddsDisplay({ odds: finalOdds, format });
  const { animation } = useOddsAnimation({ currentOdds: finalOdds, enabled: realTimeOdds });
  const { isInBetslip, addToBetslip } = useOddsSelection({
    variant: 'sport',
    outcome,
    gameId,
    eventName,
    marketType,
    participants,
    sport,
    league,
    startsAt
  });

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!isInBetslip && !disabled) {
      addToBetslip({});
    }
    
    onSelect(outcome);
  };

  // Team-specific styling
  const getTeamStyles = () => {
    const baseClasses = "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium flex-1 min-w-0 min-h-[2.5rem] transition-all duration-200";
    
    switch (teamType) {
      case 'home':
        return cn(
          baseClasses,
          "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30",
          "text-green-800 dark:text-green-300",
          "hover:bg-green-100 dark:hover:bg-green-900/30",
          isInBetslip && "ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40"
        );
      case 'away':
        return cn(
          baseClasses,
          "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30",
          "text-blue-800 dark:text-blue-300",
          "hover:bg-blue-100 dark:hover:bg-blue-900/30",
          isInBetslip && "ring-2 ring-blue-400 bg-blue-100 dark:bg-blue-900/40"
        );
      case 'draw':
        return cn(
          baseClasses,
          "bg-muted border border-border text-foreground hover:bg-muted/80",
          isInBetslip && "ring-2 ring-accent bg-muted/80"
        );
      default:
        return cn(baseClasses, "bg-muted border border-border text-foreground hover:bg-muted/80");
    }
  };

  return (
    <button 
      className={cn(getTeamStyles(), className)}
      onClick={handleClick}
      disabled={disabled || isFetching}
    >
      <span className="text-wrap break-words leading-tight">{label}</span>
      <div className="flex items-center gap-1">
        {isFetching && <Loader2 className="w-3 h-3 animate-spin opacity-60" />}
        <AnimationIndicator animation={animation} />
        <span 
          className={cn(
            "font-semibold transition-colors duration-300",
            animation === 'up' && "text-emerald-600 dark:text-emerald-400",
            animation === 'down' && "text-red-600 dark:text-red-400"
          )}
        >
          {formattedOdds}
        </span>
      </div>
    </button>
  );
};

// ===== PREDICTION VARIANT (Polymarket) =====
const PredictionOddsButton: React.FC<PredictionOddsButtonProps> = ({
  marketId,
  side,
  label,
  odds,
  onSelect,
  disabled = false,
  className,
  event,
  market,
  tokenId,
  bestBid,
  bestAsk,
  format
}) => {
  const { formattedOdds } = useOddsDisplay({ odds, format });
  // Display only - no Polymarket ticket functionality

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Display only - no action
    onSelect?.({ marketId, side });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5 transition-smooth",
        className
      )}
    >
      <span className="truncate">
        {`${label} ${formattedOdds}`}
      </span>
    </Button>
  );
};

// ===== CUSTOM VARIANT (Manual Odds Modification) =====
const CustomOddsButton: React.FC<CustomOddsButtonProps> = ({
  originalOdds,
  customOdds,
  onChange,
  disabled = false,
  className,
  showModifier = true,
  minOdds = 1.01,
  maxOdds = 50,
  format
}) => {
  const currentOdds = customOdds || originalOdds;
  const { formattedOdds } = useOddsDisplay({ odds: currentOdds, format });
  
  const handleIncrease = () => {
    const newOdds = Math.round((currentOdds + 0.1) * 100) / 100;
    if (newOdds <= maxOdds) {
      onChange(newOdds);
    }
  };

  const handleDecrease = () => {
    const newOdds = Math.round((currentOdds - 0.1) * 100) / 100;
    if (newOdds >= minOdds) {
      onChange(newOdds);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minOdds && value <= maxOdds) {
      onChange(value);
    }
  };

  const handleReset = () => {
    onChange(originalOdds);
  };

  if (disabled) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showModifier && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            disabled={currentOdds <= minOdds}
            className="h-6 w-6 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <Input
            type="number"
            value={currentOdds.toFixed(2)}
            onChange={handleInputChange}
            min={minOdds}
            max={maxOdds}
            step="0.01"
            className="h-6 w-16 text-xs text-center px-1"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            disabled={currentOdds >= maxOdds}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          {customOdds && customOdds !== originalOdds && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 px-2 text-xs"
            >
              Reset
            </Button>
          )}
        </>
      )}
      
      {!showModifier && (
        <div className="px-2 py-1 bg-muted rounded text-sm font-medium">
          {formattedOdds}
        </div>
      )}
    </div>
  );
};

// ===== SHARED ANIMATION COMPONENT =====
const AnimationIndicator: React.FC<{ animation: AnimationType }> = ({ animation }) => {
  if (!animation) return null;

  return (
    <Triangle 
      className={cn(
        "w-3 h-3 transition-all duration-500 ease-out opacity-80",
        animation === 'up' && "text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400 rotate-0",
        animation === 'down' && "text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 rotate-180"
      )}
    />
  );
};