import React, { useState, useEffect } from 'react';
import { X, Pause, AlertCircle, Triangle } from 'lucide-react';
import { useSelectionOdds } from '@azuro-org/sdk';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { cn } from '@/lib/utils';
import type { Selection, BetMode } from '../../types';
import { ConditionState } from '@/types';
import { OddsModifier } from './OddsModifier';
import { ConditionStateBadge } from '@/ui';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

// Sport icon mapping
const getSportIcon = (sportName: string): string => {
  const sport = sportName.toLowerCase();
  if (sport.includes('football') || sport.includes('soccer')) return '⚽';
  if (sport.includes('basketball')) return '🏀';
  if (sport.includes('tennis')) return '🎾';
  if (sport.includes('hockey')) return '🏒';
  if (sport.includes('baseball')) return '⚾';
  if (sport.includes('american football')) return '🏈';
  return '🏆';
};

interface SelectionCardProps {
  selection: Selection;
  onRemove: (id: string) => void;
  mode?: BetMode;
  states?: Record<string, ConditionState>;
  onOddsChange?: (selectionId: string, odds: number) => void;
  onEventClick?: (gameId: string) => void;
}

export function SelectionCard({ selection, onRemove, mode = 'REGULAR', states, onOddsChange, onEventClick }: SelectionCardProps) {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [previousOdds, setPreviousOdds] = useState<number | null>(null);
  const [animation, setAnimation] = useState<'up' | 'down' | null>(null);

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  // Fetch real-time odds using Azuro SDK
  const { data: currentOdds, isFetching } = useSelectionOdds({
    selection: {
      conditionId: selection.conditionId,
      outcomeId: selection.outcomeId
    },
    initialOdds: selection.odds,
  });

  // Track odds changes for animation
  useEffect(() => {
    if (currentOdds !== undefined && previousOdds !== null && currentOdds !== previousOdds) {
      if (currentOdds > previousOdds) {
        setAnimation('up');
      } else if (currentOdds < previousOdds) {
        setAnimation('down');
      }
      
      // Clear animation after 4 seconds (plus long pour qu'elle reste visible)
      const timer = setTimeout(() => {
        setAnimation(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
    
    if (currentOdds !== undefined) {
      setPreviousOdds(currentOdds);
    }
  }, [currentOdds, previousOdds]);

  // Get the condition state from the states prop
  const conditionState = states?.[selection.conditionId] || ConditionState.Active;
  const isActive = conditionState === ConditionState.Active;


  // Display current odds from SDK if available, otherwise fallback to the initial odds
  const displayOdds = mode === 'AGAINST_PLAYER' && selection.customOdds 
    ? selection.customOdds 
    : currentOdds || selection.odds;

  // Use formatted odds from hook
  const { formattedOdds } = useOddsDisplay({ odds: displayOdds });

  const handleOddsChange = (newOdds: number) => {
    if (onOddsChange) {
      onOddsChange(selection.id, newOdds);
    }
  };

  const renderTeamImages = () => {
    if (selection.participantImages && selection.participantImages.length >= 2) {
      return (
        <div className="flex items-center relative">
          {/* Première image d'équipe */}
          <div className="w-8 h-8 relative z-10">
            {!imageErrors['participant0'] ? (
              <img 
                src={selection.participantImages[0]} 
                alt=""
                className="w-full h-full object-contain"
                onError={() => handleImageError('participant0')}
              />
            ) : (
              <AvatarFallback 
                name={selection.eventName.split(' vs ')[0] || selection.eventName} 
                variant="team" 
                size="md"
                className="w-8 h-8"
              />
            )}
          </div>
          {/* Deuxième image d'équipe avec superposition */}
          <div className="w-8 h-8 -ml-2 relative z-0">
            {!imageErrors['participant1'] ? (
              <img 
                src={selection.participantImages[1]} 
                alt=""
                className="w-full h-full object-contain"
                onError={() => handleImageError('participant1')}
              />
            ) : (
              <AvatarFallback 
                name={selection.eventName.split(' vs ')[1] || selection.eventName} 
                variant="team" 
                size="md"
                className="w-8 h-8"
              />
            )}
          </div>
        </div>
      );
    } else if (selection.participantImages && selection.participantImages.length === 1) {
      return (
        <div className="w-8 h-8">
          {!imageErrors['participant0'] ? (
            <img 
              src={selection.participantImages[0]} 
              alt=""
              className="w-full h-full object-contain"
              onError={() => handleImageError('participant0')}
            />
          ) : (
            <AvatarFallback 
              name={selection.eventName} 
              variant="team" 
              size="md"
              className="w-8 h-8"
            />
          )}
        </div>
      );
    } else if (selection.logoUrl) {
      return !imageErrors['logo'] ? (
        <img 
          src={selection.logoUrl} 
          alt=""
          className="w-8 h-8 object-contain"
          onError={() => handleImageError('logo')}
        />
      ) : (
        <AvatarFallback 
          name={selection.eventName} 
          variant="team" 
          size="md"
          className="w-8 h-8"
        />
      );
    } else {
      return (
        <AvatarFallback 
          name={selection.eventName} 
          variant="team" 
          size="md"
          className="w-8 h-8"
        />
      );
    }
  };

  return (
    <div className={cn(
      "bg-gradient-to-r from-muted/40 to-muted/20 border border-border rounded-xl p-4 min-h-[80px] flex items-center relative transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-border/60",
      !isActive && "opacity-75 border-orange-300/50 bg-gradient-to-r from-orange-50/30 to-orange-50/10 dark:from-orange-950/20 dark:to-orange-950/10"
    )}>
      {/* Media Zone - Participant Images */}
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
        {renderTeamImages()}
      </div>

      {/* Text Block */}
      <div className="flex-1 ml-3 min-w-0">
        {/* Sport + League + Date Header */}
        {(selection.sport || selection.league || selection.startsAt) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {selection.sport && (
              <span className="font-medium">
                {getSportIcon(selection.sport.name)} {selection.sport.name}
              </span>
            )}
            {selection.league && (
              <span className="truncate">• {selection.league.name}</span>
            )}
            {selection.startsAt && (
              <span className="ml-auto">
                {new Date(selection.startsAt * 1000).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        )}
        
        <p 
          className={cn(
            "text-sm font-medium text-foreground truncate",
            onEventClick && selection.gameId && "cursor-pointer hover:text-primary transition-colors"
          )}
          onClick={() => selection.gameId && onEventClick?.(selection.gameId)}
        >
          {selection.eventName || (selection.participants && selection.participants.length >= 2 
            ? `${selection.participants[0].name} vs ${selection.participants[1].name}`
            : 'Match')}
        </p>
        
        {/* Market Type → Pick on same line */}
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-medium">{selection.marketType}</span>
          <span className="mx-1.5">→</span>
          <span className="text-primary font-medium">{selection.pick}</span>
        </p>
        
        {/* Market Status Badge */}
        {!isActive && (
          <div className="mt-1">
            <ConditionStateBadge state={conditionState} />
          </div>
        )}

        {/* Odds Modifier for AGAINST_PLAYER mode */}
        {mode === 'AGAINST_PLAYER' && isActive && (
          <div className="mt-2">
            <OddsModifier
              originalOdds={currentOdds || selection.odds}
              customOdds={selection.customOdds}
              onChange={handleOddsChange}
              disabled={!isActive}
            />
          </div>
        )}
      </div>

      {/* Odds */}
      <div className="ml-2 min-w-[50px] text-right flex-shrink-0">
        {isActive ? (
          <div className="flex items-center justify-end gap-1.5">
            {/* Animation arrow devant la cote */}
            {animation && (
              <Triangle 
                className={cn(
                  "h-3 w-3 transition-all duration-500",
                  animation === 'up' 
                    ? "text-green-500" 
                    : "text-red-500 rotate-180"
                )}
                fill="currentColor"
              />
            )}
            <span className="text-sm font-bold text-foreground">
              {formattedOdds}
              {isFetching && <span className="ml-1 animate-pulse">⟳</span>}
            </span>
          </div>
        ) : (
          <div className="text-sm font-medium text-muted-foreground">
            --
          </div>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(selection.id);
        }}
        className="absolute top-1 right-2 w-5 h-5 rounded bg-background/90 backdrop-blur-sm hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110 shadow-sm border border-border/50"
        aria-label="Remove selection"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}