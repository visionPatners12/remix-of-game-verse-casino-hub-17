import { useState, useCallback, useRef } from 'react';
import type { Color } from '../model/ludoModel';

export interface AnimatingPawn {
  playerId: string;
  pawnIndex: number;
  color: Color;
  path: number[];
  currentStep: number;
  isComplete: boolean;
}

interface UsePawnAnimationReturn {
  animatingPawn: AnimatingPawn | null;
  startAnimation: (playerId: string, pawnIndex: number, color: Color, path: number[]) => Promise<void>;
  clearAnimation: () => void;
  isAnimating: boolean;
}

const STEP_DURATION = 150; // ms per cell — smooth and visible
const MAX_ANIMATION_MS = 8000; // safety: auto-clear after 8s no matter what

export function usePawnAnimation(): UsePawnAnimationReturn {
  const [animatingPawn, setAnimatingPawn] = useState<AnimatingPawn | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnimation = useCallback(() => {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
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

      // Clear any previous animation
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

      // Safety timeout: auto-clear if realtime sync never arrives
      safetyTimeoutRef.current = setTimeout(() => {
        setAnimatingPawn(null);
        safetyTimeoutRef.current = null;
      }, MAX_ANIMATION_MS);

      if (path.length === 1) {
        setAnimatingPawn({
          playerId, pawnIndex, color, path,
          currentStep: 0,
          isComplete: true,
        });
        setTimeout(() => resolve(), STEP_DURATION);
        return;
      }

      let currentStep = 0;

      setAnimatingPawn({
        playerId, pawnIndex, color, path,
        currentStep: 0,
        isComplete: false,
      });

      const animate = () => {
        currentStep++;

        if (currentStep >= path.length - 1) {
          setAnimatingPawn({
            playerId, pawnIndex, color, path,
            currentStep: path.length - 1,
            isComplete: true,
          });
          resolve();
          return;
        }

        setAnimatingPawn(prev => {
          if (!prev) return null;
          return { ...prev, currentStep, isComplete: false };
        });

        stepTimeoutRef.current = setTimeout(animate, STEP_DURATION);
      };

      stepTimeoutRef.current = setTimeout(animate, STEP_DURATION);
    });
  }, []);

  return {
    animatingPawn,
    startAnimation,
    clearAnimation,
    isAnimating: animatingPawn !== null && !animatingPawn.isComplete,
  };
}
