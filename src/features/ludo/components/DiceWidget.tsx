/**
 * Dice Widget - Premium 3D dice with glow effects
 * Handles both local rolls and remote roll animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { isPlayerTurnSimple } from '../utils/turnValidation';
import { logger } from '@/utils/logger';
import { LUDO_COLORS } from '../model/constants';
import { cn } from '@/lib/utils';
import '../styles/dice.css';

interface DiceWidgetProps {
  gameId: string;
  currentTurn: string;
  currentPlayerColor?: string;
  isPlayerTurn: boolean;
  diceValue: number | null;
  isGameActive: boolean;
  onDiceRolled?: (diceValue: number) => void;
}

const MIN_ANIMATION_MS = 600;
const API_TIMEOUT_MS = 10000;

const getPlayerColor = (colorCode?: string) => {
  switch (colorCode) {
    case 'R': return LUDO_COLORS.RED;
    case 'G': return LUDO_COLORS.GREEN;
    case 'Y': return LUDO_COLORS.YELLOW;
    case 'B': return LUDO_COLORS.BLUE;
    default: return '#6b7280';
  }
};

const getDiceRotation = (value: number) => {
  const rotations: Record<number, string> = {
    1: 'rotateX(0deg) rotateY(0deg)',
    2: 'rotateX(0deg) rotateY(-90deg)',
    3: 'rotateX(0deg) rotateY(180deg)',
    4: 'rotateX(0deg) rotateY(90deg)',
    5: 'rotateX(-90deg) rotateY(0deg)',
    6: 'rotateX(90deg) rotateY(0deg)',
  };
  return rotations[value] || rotations[1];
};

export const DiceWidget: React.FC<DiceWidgetProps> = ({
  gameId,
  currentTurn,
  currentPlayerColor,
  isPlayerTurn,
  diceValue,
  isGameActive,
  onDiceRolled,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(1);
  const isLocalRollRef = useRef(false);
  const prevDiceRef = useRef<number | null>(null);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  const { playDiceRollSound } = useGameSounds();

  const diceColor = getPlayerColor(currentPlayerColor);

  const clearAnimTimers = useCallback(() => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
  }, []);

  const stopAnimation = useCallback((finalValue: number) => {
    clearAnimTimers();
    setDisplayValue(finalValue);
    setIsRolling(false);
  }, [clearAnimTimers]);

  const startRollingAnimation = useCallback(() => {
    clearAnimTimers();
    setIsRolling(true);
    playDiceRollSound();
    animIntervalRef.current = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
    }, 100);
  }, [clearAnimTimers, playDiceRollSound]);

  useEffect(() => {
    return clearAnimTimers;
  }, [clearAnimTimers]);

  // Handle remote dice value changes (other players rolling)
  useEffect(() => {
    if (diceValue == null) return;

    // Skip if this was our own local roll (already handled)
    if (isLocalRollRef.current) {
      prevDiceRef.current = diceValue;
      isLocalRollRef.current = false;
      return;
    }

    // Skip if the value hasn't changed
    if (diceValue === prevDiceRef.current) return;

    prevDiceRef.current = diceValue;

    if (!isRolling) {
      // Remote player rolled - show animation then hold result
      startRollingAnimation();
      animTimeoutRef.current = setTimeout(() => {
        stopAnimation(diceValue);
      }, 1400);
    } else {
      // Already rolling (e.g. local roll) - just update display when animation ends
      setDisplayValue(diceValue);
    }
  }, [diceValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync display when dice value is available but no animation is happening
  useEffect(() => {
    if (diceValue && !isRolling) {
      setDisplayValue(diceValue);
    }
  }, [diceValue, isRolling]);

  const rollDice = useCallback(async () => {
    if (isRolling || !isGameActive || !isPlayerTurn) return;

    if (!isPlayerTurnSimple(currentPlayerColor, currentTurn)) {
      toast({
        title: "Not your turn",
        description: "Please wait for your turn.",
        variant: "destructive",
      });
      return;
    }

    isLocalRollRef.current = true;
    const rollStart = Date.now();
    startRollingAnimation();

    // Safety timeout - stop spinning if API doesn't respond
    const safetyTimeout = setTimeout(() => {
      logger.warn('Dice roll API timeout after 10s');
      stopAnimation(displayValue);
      isLocalRollRef.current = false;
      toast({
        title: "Connection issue",
        description: "Roll timed out. Please try again.",
        variant: "destructive",
      });
    }, API_TIMEOUT_MS);

    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { action: 'roll', gameId },
      });

      clearTimeout(safetyTimeout);

      if (error) throw error;

      if (!data?.ok) {
        stopAnimation(displayValue);
        isLocalRollRef.current = false;
        toast({
          title: data?.code === 'FORBIDDEN' ? "Not your turn" : "Error",
          description: data?.error || 'Roll failed',
          variant: "destructive",
        });
        return;
      }

      const result = data.diceValue as number;
      prevDiceRef.current = result;

      // Keep animation for at least MIN_ANIMATION_MS
      const elapsed = Date.now() - rollStart;
      const remainingDelay = Math.max(0, MIN_ANIMATION_MS - elapsed);

      animTimeoutRef.current = setTimeout(() => {
        stopAnimation(result);
        onDiceRolled?.(result);
      }, remainingDelay);
    } catch (err: unknown) {
      clearTimeout(safetyTimeout);
      stopAnimation(displayValue);
      isLocalRollRef.current = false;

      const msg = err instanceof Error ? err.message : 'Cannot roll dice. Please retry.';
      toast({
        title: !navigator.onLine ? "Connection issue" : "Error",
        description: !navigator.onLine ? "Check your connection and retry." : msg,
        variant: "destructive",
      });
    }
  }, [
    isRolling, isGameActive, isPlayerTurn, currentPlayerColor, currentTurn,
    gameId, displayValue, startRollingAnimation, stopAnimation, onDiceRolled, toast,
  ]);

  const canRoll = isPlayerTurn && isGameActive && !isRolling;

  return (
    <motion.div
      className="relative pointer-events-auto"
      whileTap={canRoll ? { scale: 0.95 } : {}}
    >
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center",
          "w-20 h-20 rounded-2xl",
          "bg-black/60 backdrop-blur-xl border-2 transition-all duration-300",
          canRoll
            ? "border-white/20 cursor-pointer hover:border-white/40"
            : "border-white/10"
        )}
        style={{
          boxShadow: canRoll
            ? `0 0 30px ${diceColor}60, inset 0 0 20px ${diceColor}20`
            : 'none',
        }}
        onClick={canRoll ? rollDice : undefined}
        animate={
          canRoll && !isRolling
            ? {
                boxShadow: [
                  `0 0 20px ${diceColor}40`,
                  `0 0 40px ${diceColor}60`,
                  `0 0 20px ${diceColor}40`,
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="dice-container perspective-1000" style={{ width: 56, height: 56 }}>
          <div
            className={`dice-cube ${isRolling ? 'animate-dice-roll' : ''}`}
            style={{
              width: 44,
              height: 44,
              transform: getDiceRotation(displayValue),
              transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((face) => (
              <div
                key={face}
                className={`dice-face dice-face-${face}`}
                style={{
                  backgroundColor: diceColor,
                  borderColor: diceColor,
                  boxShadow: `0 0 15px ${diceColor}50`,
                  width: 44,
                  height: 44,
                  transform:
                    face === 1 ? 'translateZ(22px)' :
                    face === 2 ? 'rotateY(90deg) translateZ(22px)' :
                    face === 3 ? 'rotateY(180deg) translateZ(22px)' :
                    face === 4 ? 'rotateY(-90deg) translateZ(22px)' :
                    face === 5 ? 'rotateX(90deg) translateZ(22px)' :
                    'rotateX(-90deg) translateZ(22px)',
                }}
              >
                <div className={`dice-dots dice-${face}`}>
                  {Array.from({ length: face }).map((_, i) => (
                    <span key={i} className="dice-dot" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {canRoll && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-[9px] font-medium text-white/60 uppercase tracking-wider">
              Tap to Roll
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiceWidget;
