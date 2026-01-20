/**
 * Floating Game Controls - Bottom overlay with Timer, Dice, Pot
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TimerWidget } from './TimerWidget';
import { DiceWidget } from './DiceWidget';
import { PotWidget } from './PotWidget';

interface FloatingGameControlsProps {
  // Timer props
  turnStartedAt?: string;
  currentTurn?: string;
  isCurrentTurn: boolean;
  onTimeExpired?: () => void;
  
  // Dice props
  gameId: string;
  currentPlayerColor?: string;
  isPlayerTurn: boolean;
  diceValue: number | null;
  isGameActive: boolean;
  onDiceRolled?: (diceValue: number) => void;
  isSpectator?: boolean;
  
  // Pot props
  potAmount: number;
  betAmount?: number;
}

export const FloatingGameControls: React.FC<FloatingGameControlsProps> = ({
  turnStartedAt,
  currentTurn,
  isCurrentTurn,
  onTimeExpired,
  gameId,
  currentPlayerColor,
  isPlayerTurn,
  diceValue,
  isGameActive,
  onDiceRolled,
  isSpectator,
  potAmount,
  betAmount,
}) => {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Gradient backdrop for visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      
      {/* Controls row */}
      <div className="relative flex items-end justify-between px-4 pb-2">
        {/* Timer - left */}
        <TimerWidget
          turnStartedAt={turnStartedAt}
          currentTurn={currentTurn}
          turnDuration={30}
          isCurrentTurn={isCurrentTurn}
          onTimeExpired={onTimeExpired}
        />

        {/* Dice - center (elevated) */}
        <div className="relative -mt-8">
          <DiceWidget
            gameId={gameId}
            currentTurn={currentTurn || ''}
            currentPlayerColor={currentTurn}
            isPlayerTurn={!isSpectator && isPlayerTurn}
            diceValue={diceValue}
            isGameActive={isGameActive}
            onDiceRolled={onDiceRolled}
          />
        </div>

        {/* Pot - right */}
        <PotWidget amount={potAmount} betAmount={betAmount} />
      </div>
    </motion.div>
  );
};

export default FloatingGameControls;
