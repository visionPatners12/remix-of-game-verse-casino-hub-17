/**
 * Game actions hook - handles all game interactions
 * Encapsulates API calls, validation, and state updates
 */

import { useCallback, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { ludoApi } from '../services/ludoApi';
import { validateTurnWithRetry } from '../utils/turnValidation';
import { generatePath } from '../utils/pathGenerator';
import { START_INDEX } from '../model/ludoModel';
import { logger } from '@/utils/logger';
import type { Color, UIMove, GameData, PlayerData, AnimatingPawn } from '../types';

interface UseLudoGameActionsProps {
  gameId: string;
  gameData: GameData | null;
  currentPlayer: PlayerData | null;
  possibleMoves: UIMove[];
  waitingForMove: boolean;
  isMoving: boolean;
  isAnimating: boolean;
  setWaitingForMove: (waiting: boolean) => void;
  setPossibleMoves: (moves: UIMove[]) => void;
  setIsMoving: (moving: boolean) => void;
  startAnimation: (playerId: string, pawnIndex: number, color: Color, path: number[]) => Promise<void>;
  clearAnimation: () => void;
}

export const useLudoGameActions = ({
  gameId,
  gameData,
  currentPlayer,
  possibleMoves,
  waitingForMove,
  isMoving,
  isAnimating,
  setWaitingForMove,
  setPossibleMoves,
  setIsMoving,
  startAnimation,
  clearAnimation,
}: UseLudoGameActionsProps) => {
  const { toast } = useToast();
  const { playPieceMoveSound } = useGameSounds();
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [skipRollTrigger, setSkipRollTrigger] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle dice rolled - calculate possible moves
   */
  const handleDiceRolled = useCallback((diceValue: number, calculatePossibleMoves: (dice: number, color: string, positions: any) => UIMove[]) => {
    if (!currentPlayer || !gameData?.positions) return;

    const moves = calculatePossibleMoves(diceValue, currentPlayer.color, gameData.positions);
    setPossibleMoves(moves);
    setWaitingForMove(moves.length > 0);
  }, [currentPlayer, gameData?.positions, setPossibleMoves, setWaitingForMove]);

  /**
   * Handle pawn click - internal implementation
   */
  const handlePawnClickInternal = useCallback(async (playerId: string, pawnIndex: number) => {
    logger.debug('🎯 Pawn click attempt:', {
      playerId,
      pawnIndex,
      isMoving,
      isAnimating,
      waitingForMove,
      currentPlayerColor: currentPlayer?.color,
      gameDataTurn: gameData?.turn
    });

    if (!waitingForMove || isMoving || isAnimating) {
      logger.debug('❌ Click ignored - not waiting for move or already moving/animating');
      return;
    }

    const move = possibleMoves.find(m => m.pawnIndex === pawnIndex);
    if (!move) {
      logger.debug('❌ Click ignored - no valid move for this pawn');
      return;
    }

    // Enhanced validation with retry before making move
    const validationResult = await validateTurnWithRetry({
      currentPlayerColor: currentPlayer?.color,
      gameDataTurn: gameData?.turn,
      isGameActive: gameData?.status === 'active',
      diceValue: gameData?.dice,
      waitingForMove
    });

    if (!validationResult.isValid) {
      logger.warn('❌ Pawn move blocked by validation:', validationResult);

      if (validationResult.canRetry) {
        toast({
          title: "Synchronizing",
          description: "Data is syncing, please retry.",
          variant: "default"
        });
      } else {
        toast({
          title: "Action not allowed",
          description: validationResult.reason,
          variant: "destructive"
        });
      }
      return;
    }

    setIsMoving(true);
    logger.debug('🔄 Starting pawn movement...');

    // Calculate current start position
    const playerPositions = gameData?.positions?.[currentPlayer!.color as Color] ?? [];
    const currentPos = playerPositions[pawnIndex];

    // Generate path for animation
    const targetPos = move.target ?? START_INDEX[currentPlayer!.color as Color];
    const path = generatePath(currentPos, targetPos, currentPlayer!.color as Color);

    logger.debug('🚶 Animation path:', { currentPos, targetPos, path });

    // Start animation and wait for it to finish
    if (path.length > 0) {
      playPieceMoveSound();
      await startAnimation(playerId, pawnIndex, currentPlayer!.color as Color, path);
    }

    try {
      const data = await ludoApi.move(gameId, pawnIndex);

      // Check for backend error response
      if (!data?.ok) {
        const errorMessage = data?.error || 'Move failed';
        throw new Error(errorMessage);
      }

      // Animation will be cleared by useEffect when realtime positions sync
      logger.debug('✅ Move successful, waiting for realtime sync:', data);

      setWaitingForMove(false);
      setPossibleMoves([]);

      // Handle captured pawn feedback
      if (data.moveResult?.capturedPawn) {
        toast({
          title: "Pawn captured!",
          description: `Captured ${data.moveResult.capturedPawn.color} pawn`,
        });
      } else {
        toast({
          title: "Move successful",
          description: data.moveResult?.valid ? "Pawn moved" : "Move processed",
        });
      }

      // Check if this move finished the game
      if (data.finished && data.winner) {
        logger.debug('🏆 Game finished after move:', data.winner);
      }

    } catch (error: any) {
      // On error, clear animation too
      clearAnimation();
      logger.error('❌ Move failed:', error);

      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const isNotYourTurnError = errorMessage.includes('Not your turn');

      if (isNotYourTurnError) {
        toast({
          title: "Sync error",
          description: "Game data not synchronized. Please wait and retry.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Cannot move pawn",
          variant: "destructive"
        });
      }
    } finally {
      setIsMoving(false);
      logger.debug('🏁 Movement finished');
    }
  }, [
    waitingForMove,
    isMoving,
    isAnimating,
    possibleMoves,
    currentPlayer,
    gameData,
    gameId,
    setIsMoving,
    setWaitingForMove,
    setPossibleMoves,
    startAnimation,
    clearAnimation,
    playPieceMoveSound,
    toast
  ]);

  /**
   * Debounced pawn click handler
   */
  const handlePawnClick = useCallback((playerId: string, pawnIndex: number) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      handlePawnClickInternal(playerId, pawnIndex);
    }, 100);
  }, [handlePawnClickInternal]);

  /**
   * Handle timer expiration - auto play
   */
  const handleTimeExpired = useCallback(async () => {
    if (isAutoPlaying || gameData?.status !== 'active') return;

    setIsAutoPlaying(true);
    try {
      const data = await ludoApi.autoPlay(gameId);

      if (!data?.ok) {
        logger.debug('AutoPlay rejected:', data?.code, data?.error);
      } else if (data?.action === 'auto_played') {
        toast({
          title: "⏰ Time's up!",
          description: `Auto-played a move`,
        });
      } else if (data?.action === 'auto_no_move') {
        toast({
          title: "⏰ Time's up!",
          description: "No valid moves - turn skipped",
        });
      } else if (data?.action === 'aborted_or_finished') {
        toast({
          title: "Game ended",
          description: data?.winner ? `Winner: ${data.winner}` : "Game was aborted",
        });
      }
    } catch (error) {
      logger.debug('AutoPlay already triggered by another player');
    } finally {
      setIsAutoPlaying(false);
    }
  }, [gameId, isAutoPlaying, gameData?.status, toast]);

  /**
   * Start the game (creator only)
   */
  const startGame = useCallback(async (userId?: string) => {
    if (!gameData || !userId || gameData.created_by !== userId) return;

    setIsStartingGame(true);
    try {
      const data = await ludoApi.start(gameId);

      if (!data?.ok) {
        throw new Error(data?.error || 'Failed to start game');
      }

      toast({
        title: "Game started!",
        description: "The game has begun successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Unable to start the game.",
        variant: "destructive"
      });
    } finally {
      setIsStartingGame(false);
    }
  }, [gameId, gameData, toast]);

  /**
   * Trigger skip roll animation
   */
  const triggerSkipRoll = useCallback(() => {
    setSkipRollTrigger(prev => prev + 1);
  }, []);

  return {
    handleDiceRolled,
    handlePawnClick,
    handleTimeExpired,
    startGame,
    triggerSkipRoll,
    skipRollTrigger,
    isAutoPlaying,
    isStartingGame,
  };
};

export default useLudoGameActions;
