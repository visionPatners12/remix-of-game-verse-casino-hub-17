// ===== ODDS ANIMATION HOOK =====

import { useState, useEffect, useCallback } from 'react';

type AnimationType = 'up' | 'down' | null;

interface OddsAnimationHook {
  animation: AnimationType;
  previousOdds: number | null;
  triggerAnimation: (currentOdds: number) => void;
}

interface UseOddsAnimationOptions {
  currentOdds: number;
  animationDuration?: number;
  enabled?: boolean;
}

export function useOddsAnimation({ 
  currentOdds, 
  animationDuration = 2500,
  enabled = true 
}: UseOddsAnimationOptions): OddsAnimationHook {
  
  const [previousOdds, setPreviousOdds] = useState<number | null>(null);
  const [animation, setAnimation] = useState<AnimationType>(null);

  // Trigger animation when odds change
  const triggerAnimation = useCallback((newOdds: number) => {
    if (!enabled || previousOdds === null || newOdds === previousOdds) {
      return;
    }

    const animationType: AnimationType = newOdds > previousOdds ? 'up' : 'down';
    setAnimation(animationType);

    const timer = setTimeout(() => {
      setAnimation(null);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [previousOdds, animationDuration, enabled]);

  // Track odds changes
  useEffect(() => {
    if (currentOdds && enabled) {
      if (previousOdds !== null && currentOdds !== previousOdds) {
        triggerAnimation(currentOdds);
      }
      setPreviousOdds(currentOdds);
    }
  }, [currentOdds, previousOdds, triggerAnimation, enabled]);

  return {
    animation,
    previousOdds,
    triggerAnimation
  };
}