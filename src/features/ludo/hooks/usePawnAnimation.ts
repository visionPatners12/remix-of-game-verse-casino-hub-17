import { useState, useCallback, useRef } from 'react';
import type { Color } from '../model/ludoModel';

export interface AnimatingPawn {
  playerId: string;
  pawnIndex: number;
  color: Color;
  path: number[];
  currentStep: number;
  isComplete: boolean; // Animation terminée mais pas encore confirmée par backend
}

interface UsePawnAnimationReturn {
  animatingPawn: AnimatingPawn | null;
  startAnimation: (playerId: string, pawnIndex: number, color: Color, path: number[]) => Promise<void>;
  clearAnimation: () => void; // Appelé après confirmation backend
  isAnimating: boolean;
}

const STEP_DURATION = 120; // ms par case

export function usePawnAnimation(): UsePawnAnimationReturn {
  const [animatingPawn, setAnimatingPawn] = useState<AnimatingPawn | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAnimatingPawn(null);
  }, []);

  const startAnimation = useCallback((
    playerId: string, 
    pawnIndex: number, 
    color: Color,
    path: number[]
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (path.length === 0) {
        resolve();
        return;
      }

      // Nettoyer tout timeout précédent
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si une seule case (saut direct), pas d'animation pas-à-pas
      if (path.length === 1) {
        setAnimatingPawn({
          playerId,
          pawnIndex,
          color,
          path,
          currentStep: 0,
          isComplete: true
        });
        
        // Résoudre immédiatement mais garder la position
        setTimeout(() => resolve(), STEP_DURATION);
        return;
      }

      let currentStep = 0;
      
      setAnimatingPawn({
        playerId,
        pawnIndex,
        color,
        path,
        currentStep: 0,
        isComplete: false
      });

      const animate = () => {
        currentStep++;
        
        if (currentStep >= path.length - 1) {
          // Animation terminée - garder le pion à la position finale
          setAnimatingPawn({
            playerId,
            pawnIndex,
            color,
            path,
            currentStep: path.length - 1,
            isComplete: true // Marquer comme complete mais NE PAS effacer
          });
          resolve();
          return;
        }

        setAnimatingPawn(prev => {
          if (!prev) return null;
          return { ...prev, currentStep, isComplete: false };
        });

        timeoutRef.current = setTimeout(animate, STEP_DURATION);
      };

      timeoutRef.current = setTimeout(animate, STEP_DURATION);
    });
  }, []);

  return {
    animatingPawn,
    startAnimation,
    clearAnimation,
    isAnimating: animatingPawn !== null && !animatingPawn.isComplete
  };
}
