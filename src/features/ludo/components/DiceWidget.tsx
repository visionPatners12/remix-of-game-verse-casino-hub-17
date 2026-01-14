/**
 * Dice Widget - Premium 3D dice with glow effects
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { validateTurnWithRetry } from '../utils/turnValidation';
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
  triggerRoll?: number;
}

export const DiceWidget: React.FC<DiceWidgetProps> = ({
  gameId,
  currentTurn,
  currentPlayerColor,
  isPlayerTurn,
  diceValue,
  isGameActive,
  onDiceRolled,
  triggerRoll
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [animationValue, setAnimationValue] = useState(1);
  const { toast } = useToast();
  const { playDiceRollSound } = useGameSounds();

  const getPlayerColor = (colorCode?: string) => {
    switch (colorCode) {
      case 'R': return LUDO_COLORS.RED;
      case 'G': return LUDO_COLORS.GREEN;
      case 'Y': return LUDO_COLORS.YELLOW;
      case 'B': return LUDO_COLORS.BLUE;
      default: return '#6b7280';
    }
  };

  const diceColor = getPlayerColor(currentPlayerColor);

  useEffect(() => {
    if (diceValue && !isRolling) {
      setAnimationValue(diceValue);
    }
  }, [diceValue, isRolling]);

  useEffect(() => {
    if (triggerRoll && triggerRoll > 0 && !isRolling) {
      setIsRolling(true);
      playDiceRollSound();
      
      const animationInterval = setInterval(() => {
        setAnimationValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      
      const timeout = setTimeout(() => {
        clearInterval(animationInterval);
        setIsRolling(false);
      }, 1500);
      
      return () => {
        clearInterval(animationInterval);
        clearTimeout(timeout);
      };
    }
  }, [triggerRoll]);

  const rollDice = async () => {
    if (isRolling) return;

    const validationResult = await validateTurnWithRetry({
      currentPlayerColor,
      gameDataTurn: currentTurn,
      isGameActive,
      diceValue
    });

    if (!validationResult.isValid) {
      if (validationResult.canRetry) {
        toast({
          title: "Synchronizing",
          description: "Data is syncing, please retry.",
        });
      } else {
        toast({
          title: "Not your turn",
          description: validationResult.reason,
          variant: "destructive"
        });
      }
      return;
    }

    setIsRolling(true);
    playDiceRollSound();
    
    const animationInterval = setInterval(() => {
      setAnimationValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { action: 'roll', gameId }
      });

      if (error) throw error;

      if (!data?.ok) {
        clearInterval(animationInterval);
        setIsRolling(false);
        toast({
          title: "Error",
          description: data?.error || "Roll failed",
          variant: "destructive"
        });
        return;
      }

      setTimeout(() => {
        clearInterval(animationInterval);
        setAnimationValue(data.diceValue);
        setIsRolling(false);
        onDiceRolled?.(data.diceValue);
      }, 1500);

    } catch (error: any) {
      clearInterval(animationInterval);
      setIsRolling(false);
      toast({
        title: "Error",
        description: error?.message || "Cannot roll dice",
        variant: "destructive"
      });
    }
  };

  const getDiceRotation = (value: number) => {
    const rotations = {
      1: 'rotateX(0deg) rotateY(0deg)',
      2: 'rotateX(0deg) rotateY(-90deg)',
      3: 'rotateX(0deg) rotateY(180deg)',
      4: 'rotateX(0deg) rotateY(90deg)',
      5: 'rotateX(-90deg) rotateY(0deg)',
      6: 'rotateX(90deg) rotateY(0deg)'
    };
    return rotations[value as keyof typeof rotations] || rotations[1];
  };

  const canRoll = isPlayerTurn && isGameActive && !isRolling;

  return (
    <motion.div
      className="relative pointer-events-auto"
      whileTap={canRoll ? { scale: 0.95 } : {}}
    >
      {/* Main dice container */}
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
            : 'none'
        }}
        onClick={canRoll ? rollDice : undefined}
        animate={canRoll && !isRolling ? { 
          boxShadow: [
            `0 0 20px ${diceColor}40`,
            `0 0 40px ${diceColor}60`,
            `0 0 20px ${diceColor}40`
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* 3D Dice */}
        <div className="dice-container perspective-1000" style={{ width: 56, height: 56 }}>
          <div 
            className={`dice-cube ${isRolling ? 'animate-dice-roll' : ''}`}
            style={{
              width: 44,
              height: 44,
              transform: getDiceRotation(animationValue),
              transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
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
                  transform: face === 1 ? 'translateZ(22px)' :
                             face === 2 ? 'rotateY(90deg) translateZ(22px)' :
                             face === 3 ? 'rotateY(180deg) translateZ(22px)' :
                             face === 4 ? 'rotateY(-90deg) translateZ(22px)' :
                             face === 5 ? 'rotateX(90deg) translateZ(22px)' :
                             'rotateX(-90deg) translateZ(22px)'
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

      {/* Tap to roll hint */}
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
