import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { validateTurnWithRetry } from '../utils/turnValidation';
import { logger } from '@/utils/logger';
import { LUDO_COLORS } from '../model/constants';

// Helper to detect network-related errors
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('aborted') ||
    (error.name === 'TypeError' && !navigator.onLine)
  );
};

interface DiceRollerProps {
  gameId: string;
  currentTurn: string;
  currentPlayerColor?: string;
  isPlayerTurn: boolean;
  diceValue: number | null;
  isGameActive: boolean;
  onDiceRolled?: (diceValue: number) => void;
  triggerRoll?: number; // Counter to trigger animation externally (e.g., on skip)
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
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

  // Map player color codes to actual colors
  const getPlayerColor = (colorCode?: string) => {
    switch (colorCode) {
      case 'R': return LUDO_COLORS.RED;
      case 'G': return LUDO_COLORS.GREEN;
      case 'Y': return LUDO_COLORS.YELLOW;
      case 'B': return LUDO_COLORS.BLUE;
      default: return '#6b7280'; // Neutral gray
    }
  };

  const diceColor = getPlayerColor(currentPlayerColor);

  // Reset animation when dice value changes
  useEffect(() => {
    if (diceValue && !isRolling) {
      setAnimationValue(diceValue);
    }
  }, [diceValue, isRolling]);

  // Trigger animation externally (e.g., when skip happens)
  useEffect(() => {
    if (triggerRoll && triggerRoll > 0 && !isRolling) {
      setIsRolling(true);
      playDiceRollSound();
      
      const animationInterval = setInterval(() => {
        setAnimationValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      
      // Stop animation after 1.5 seconds
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
    // Enhanced validation with logging and retry logic
    logger.debug('🎲 Dice roll attempt:', {
      isPlayerTurn,
      isGameActive,
      isRolling,
      currentTurn,
      currentPlayerColor
    });

    if (isRolling) {
      logger.debug('❌ Dice roll blocked - already rolling');
      return;
    }

    // Enhanced turn validation with retry
    const validationResult = await validateTurnWithRetry({
      currentPlayerColor,
      gameDataTurn: currentTurn,
      isGameActive,
      diceValue
    });

    if (!validationResult.isValid) {
      logger.warn('❌ Dice roll blocked by validation:', validationResult);
      
      if (validationResult.canRetry) {
        toast({
          title: "Synchronizing",
          description: "Data is syncing, please retry in a moment.",
          variant: "default"
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

    logger.debug('✅ Dice roll validation passed, proceeding...');
    setIsRolling(true);
    playDiceRollSound();
    
    // Start animation
    const animationInterval = setInterval(() => {
      setAnimationValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { 
          action: 'roll',
          gameId 
        }
      });

      if (error) throw error;

      // Check for backend error response
      if (!data?.ok) {
        const errorCode = data?.code;
        const errorMessage = data?.error || 'Roll failed';
        
        clearInterval(animationInterval);
        setIsRolling(false);
        
        // Handle specific error codes
        if (errorCode === 'FORBIDDEN') {
          toast({
            title: "Not your turn",
            description: errorMessage,
            variant: "destructive"
          });
        } else if (errorCode === 'BAD_STATE') {
          toast({
            title: "Cannot roll",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
        return;
      }

      logger.debug('🎯 Dice roll successful:', data);

      // Stop animation after 1.5 seconds and show result
      setTimeout(() => {
        clearInterval(animationInterval);
        setAnimationValue(data.diceValue);
        setIsRolling(false);
        
        // Notify parent about dice result
        onDiceRolled?.(data.diceValue);
        
        // Check if roll triggered game end
        if (data.finished && data.winner) {
          logger.debug('🏆 Game finished after roll:', data.winner);
        }
      }, 1500);

    } catch (error: any) {
      clearInterval(animationInterval);
      setIsRolling(false);
      
      logger.error('💥 Dice roll failed:', error);
      
      // Explicit network error detection
      if (isNetworkError(error) || !navigator.onLine) {
        toast({
          title: "Connection issue",
          description: "Unable to send roll. Check your connection and retry.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Cannot roll dice. Please retry.",
          variant: "destructive"
        });
      }
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

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full 
        bg-background/60 backdrop-blur-md border border-border/30
        transition-all duration-300
        ${isPlayerTurn && isGameActive ? 'ring-2 ring-offset-2 ring-offset-background cursor-pointer' : ''}
        ${isPlayerTurn && isGameActive && !isRolling ? 'hover:bg-background/80 active:scale-95' : ''}
      `}
      style={{
        boxShadow: isPlayerTurn && isGameActive ? `0 0 20px ${diceColor}40` : 'none',
        borderColor: isPlayerTurn && isGameActive ? diceColor : undefined,
        // @ts-ignore
        '--tw-ring-color': diceColor,
      }}
      onClick={isPlayerTurn && isGameActive && !isRolling ? rollDice : undefined}
    >
      {/* 3D Dice */}
      <div className="dice-container-small perspective-1000">
        <div 
          className={`dice-cube-small ${isRolling ? 'animate-dice-roll' : ''}`}
          style={{
            transform: getDiceRotation(animationValue),
            transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        >
          <div 
            className="dice-face dice-face-1"
            style={{ 
              backgroundColor: diceColor,
              borderColor: diceColor,
              boxShadow: `0 0 10px ${diceColor}40`
            }}
          >
            <div className="dice-dots dice-1">
              <span className="dice-dot" />
            </div>
          </div>
          <div 
            className="dice-face dice-face-2"
            style={{ 
              backgroundColor: diceColor,
              borderColor: diceColor,
              boxShadow: `0 0 10px ${diceColor}40`
            }}
          >
            <div className="dice-dots dice-2">
              <span className="dice-dot" />
              <span className="dice-dot" />
            </div>
          </div>
          <div 
            className="dice-face dice-face-3"
            style={{ 
              backgroundColor: diceColor,
              borderColor: diceColor,
              boxShadow: `0 0 10px ${diceColor}40`
            }}
          >
            <div className="dice-dots dice-3">
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
            </div>
          </div>
          <div 
            className="dice-face dice-face-4"
            style={{ 
              backgroundColor: diceColor,
              borderColor: diceColor,
              boxShadow: `0 0 10px ${diceColor}40`
            }}
          >
            <div className="dice-dots dice-4">
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
            </div>
          </div>
          <div 
            className="dice-face dice-face-5"
            style={{ 
              backgroundColor: diceColor,
              borderColor: diceColor,
              boxShadow: `0 0 10px ${diceColor}40`
            }}
          >
            <div className="dice-dots dice-5">
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
            </div>
          </div>
          <div 
            className="dice-face dice-face-6"
            style={{ 
              backgroundColor: diceColor,
              borderColor: diceColor,
              boxShadow: `0 0 10px ${diceColor}40`
            }}
          >
            <div className="dice-dots dice-6">
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
              <span className="dice-dot" />
            </div>
          </div>
        </div>
      </div>

      {/* Roll text indicator */}
      {isGameActive && (
        <span 
          className={`
            text-xs font-medium transition-all duration-300
            ${isPlayerTurn ? 'opacity-100' : 'opacity-50'}
          `}
          style={{ color: isPlayerTurn ? diceColor : undefined }}
        >
          {isRolling ? '...' : isPlayerTurn ? 'Roll' : ''}
        </span>
      )}
    </div>
  );
};