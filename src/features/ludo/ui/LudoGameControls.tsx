/**
 * Ludo Game Controls Component
 * Timer, Dice, and Prize Pool in a single row
 */

import React from 'react';
import { DiceRoller } from '../components/DiceRoller';
import { TurnTimer } from '../components/TurnTimer';
import { PrizePoolBadge } from '../components/PrizePoolBadge';

interface LudoGameControlsProps {
  gameId: string;
  turnStartedAt?: string;
  currentTurn?: string;
  currentPlayerColor?: string;
  isPlayerTurn: boolean;
  isSpectator: boolean;
  diceValue: number | null;
  isGameActive: boolean;
  betAmount: number;
  pot?: number;
  playersCount: number;
  skipRollTrigger?: number;
  onDiceRolled?: (diceValue: number) => void;
  onTimeExpired: () => void;
}

export const LudoGameControls: React.FC<LudoGameControlsProps> = ({
  gameId,
  turnStartedAt,
  currentTurn,
  currentPlayerColor,
  isPlayerTurn,
  isSpectator,
  diceValue,
  isGameActive,
  betAmount,
  pot,
  playersCount,
  skipRollTrigger,
  onDiceRolled,
  onTimeExpired,
}) => {
  return (
    <div className="flex items-center justify-between px-3 pb-2 gap-3">
      {/* Timer */}
      <TurnTimer
        turnStartedAt={turnStartedAt}
        currentTurn={currentTurn}
        turnDuration={30}
        isCurrentTurn={isPlayerTurn}
        onTimeExpired={onTimeExpired}
      />

      {/* Dice - centered (disabled for spectators) */}
      <DiceRoller
        gameId={gameId}
        currentTurn={currentTurn || ''}
        currentPlayerColor={currentTurn}
        isPlayerTurn={!isSpectator && isPlayerTurn}
        diceValue={diceValue}
        isGameActive={isGameActive}
        onDiceRolled={onDiceRolled}
        triggerRoll={skipRollTrigger}
      />

      {/* Prize Pool */}
      <PrizePoolBadge
        betAmount={betAmount}
        pot={pot}
        playersCount={playersCount}
      />
    </div>
  );
};

export default LudoGameControls;
