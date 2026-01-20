/**
 * Game actions hook - handles all game interactions
 * Encapsulates API calls, validation, and state updates
 * Uses optimistic UI pattern for instant feedback
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { ludoApi } from '../services/ludoApi';
import { isPlayerTurnSimple } from '../utils/turnValidation';
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
   * Handle pawn click - optimistic UI pattern for instant feedback
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

    // Simple synchronous validation - no async delays
    if (!isPlayerTurnSimple(currentPlayer?.color, gameData?.turn)) {
      logger.debug('❌ Not your turn');
      return;
    }

    // Store current state for potential rollback
    const previousPossibleMoves = [...possibleMoves];

    // OPTIMISTIC UI: Update state immediately
    setIsMoving(true);
    setWaitingForMove(false);
    setPossibleMoves([]);
    
    logger.debug('🔄 Starting optimistic pawn movement...');

    // Calculate path for animation
    const playerPositions = gameData?.positions?.[currentPlayer!.color as Color] ?? [];
    const currentPos = playerPositions[pawnIndex];
    const targetPos = move.target ?? START_INDEX[currentPlayer!.color as Color];
    const path = generatePath(currentPos, targetPos, currentPlayer!.color as Color);

    logger.debug('🚶 Animation path:', { currentPos, targetPos, path });

    // Start sound and animation IMMEDIATELY
    playPieceMoveSound();
    
    // Create promises for parallel execution
    const animationPromise = path.length > 0 
      ? startAnimation(playerId, pawnIndex, currentPlayer!.color as Color, path)
      : Promise.resolve();
    
    const apiPromise = ludoApi.move(gameId, pawnIndex);

    try {
      // Wait for both animation and API in parallel
      const [, data] = await Promise.all([animationPromise, apiPromise]);

      // Check for backend error response
      if (!data?.ok) {
        const errorMessage = data?.error || 'Move failed';
        throw new Error(errorMessage);
      }

      // Animation will be cleared by useEffect when realtime positions sync
      logger.debug('✅ Move successful, waiting for realtime sync:', data);

      // Handle captured pawn feedback
      if (data.moveResult?.capturedPawn) {
        toast({
          title: "Pawn captured!",
          description: `Captured ${data.moveResult.capturedPawn.color} pawn`,
        });
      }

      // Check if this move finished the game
      if (data.finished && data.winner) {
        logger.debug('🏆 Game finished after move:', data.winner);
      }

    } catch (error: any) {
      // ROLLBACK: Clear animation and restore state
      clearAnimation();
      setWaitingForMove(true);
      setPossibleMoves(previousPossibleMoves);
      
      logger.error('❌ Move failed, rolling back:', error);

      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const isNotYourTurnError = errorMessage.includes('Not your turn');

      toast({
        title: isNotYourTurnError ? "Sync error" : "Error",
        description: isNotYourTurnError 
          ? "Game data not synchronized. Please wait and retry."
          : (errorMessage || "Cannot move pawn"),
        variant: "destructive"
      });
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
   * Direct pawn click handler - no debounce for instant response
   */
  const handlePawnClick = useCallback((playerId: string, pawnIndex: number) => {
    handlePawnClickInternal(playerId, pawnIndex);
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

  return {
    handleDiceRolled,
    handlePawnClick,
    handleTimeExpired,
    startGame,
    isAutoPlaying,
    isStartingGame,
  };
};

export default useLudoGameActions;
