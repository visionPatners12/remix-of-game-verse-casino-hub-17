import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { supabase } from '@/integrations/supabase/client';
import { BoardKonva } from '@/features/ludo';

import { ShareGameModal } from '../components/ShareGameModal';
import { PlayerProfileCard } from '../components/PlayerProfileCard';
import { WinnerModal } from '../components/WinnerModal';
import { LudoGameHUD } from './LudoGameHUD';
import { FloatingGameControls } from '../components/FloatingGameControls';
import { useLeaveGame } from '../hooks/useLeaveGame';
import { LudoWaitingRoom } from '../components/waiting-room';
import { useAutoJoin } from '../hooks/useAutoJoin';
import { useRealtimeGame } from '../hooks/useRealtimeGame';
import { usePlayersWithUsernames } from '../hooks/usePlayersWithUsernames';
import { usePawnAnimation } from '../hooks/usePawnAnimation';
import { useLudoGameActions } from '../hooks/useLudoGameActions';
import { isInEnemyPrison, getPossibleMoves as getModelPossibleMoves } from '../model/movement';
import type { Color } from '../model/ludoModel';
import type { UIMove, Positions } from '../types';
import { HOME_BASE } from '../model/ludoModel';
import { generatePath } from '../utils/pathGenerator';
import { isPlayerTurnSimple } from '../utils/turnValidation';
import { logger } from '@/utils/logger';
import '../styles/dice.css';

function calculatePossibleMoves(diceValue: number, playerColor: string, positions: Positions): UIMove[] {
  if (!positions || !playerColor) return [];
  
  const gameState = {
    R: positions.R ?? [-10, -11, -12, -13],
    G: positions.G ?? [-20, -21, -22, -23],
    Y: positions.Y ?? [-30, -31, -32, -33],
    B: positions.B ?? [-40, -41, -42, -43],
  };
  
  const color = playerColor as Color;
  const modelMoves = getModelPossibleMoves(gameState, color, diceValue);
  
  return modelMoves.map(({ pawnIndex, moveResult }) => {
    const pos = gameState[color][pawnIndex];
    const isHome = pos <= HOME_BASE[color] && pos >= HOME_BASE[color] - 3;
    const isPrison = isInEnemyPrison(pos, color);
    
    let from: 'home' | 'prison' | 'track' = 'track';
    if (isHome) from = 'home';
    else if (isPrison) from = 'prison';
    
    return {
      pawnIndex,
      from,
      canExit: from === 'home' || from === 'prison',
      target: moveResult.newPosition,
    };
  });
}

export const LudoKonva: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { playPieceMoveSound } = useGameSounds();
  const [showShareModal, setShowShareModal] = useState(false);
  // Note: isStartingGame is now from useLudoGameActions hook
  const [waitingForMove, setWaitingForMove] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<UIMove[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  // skipRollTrigger removed - dice should not animate on skip
  const [winnerInfo, setWinnerInfo] = useState<{
    color: string;
    name: string;
    avatar?: string;
    isMe: boolean;
    potAmount?: number;
  } | null>(null);
  
  // Use our custom hooks
  const { isJoining } = useAutoJoin(gameId || '');
  const { gameData, players, currentPlayer, loading, isOnline } = useRealtimeGame(gameId || '');
  const { playersWithUsernames } = usePlayersWithUsernames(players);
  const { leaveGame, isLeaving } = useLeaveGame();
  const { animatingPawn, startAnimation, clearAnimation, isAnimating } = usePawnAnimation();
  
  // Refs for remote animation detection
  const isLocalMoveRef = useRef<boolean>(false);
  const previousPositionsRef = useRef<Record<string, number[]> | null>(null);
  
  // Use hook for game actions - MUST be called before any conditional returns (Rules of Hooks)
  const { startGame, isStartingGame: hookIsStarting, handlePawnClick } = useLudoGameActions({
    gameId: gameId || '',
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
    onLocalMoveStart: () => {
      isLocalMoveRef.current = true;
    },
  });
  
  // Memoized start game handler - also before conditional returns
  const handleStartGame = useCallback(() => {
    startGame(user?.id);
  }, [startGame, user?.id]);

  // Auto-play handler when timer expires - only the active player triggers it
  // Adds a visible delay so the user can see the timeout before auto-play executes
  const handleTimeExpired = useCallback(async () => {
    if (isAutoPlaying || gameData?.status !== 'active') return;
    if (currentPlayer?.color !== gameData?.turn) return;
    
    setIsAutoPlaying(true);

    toast({
      title: "⏰ Time's up!",
      description: "Auto-playing your turn...",
    });

    // Let the user see the timeout notification before auto-playing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { action: 'autoPlay', gameId }
      });

      if (error) {
        logger.debug('AutoPlay error:', error);
      } else if (!data?.ok) {
        logger.debug('AutoPlay rejected:', data?.code, data?.error);
      } else if (data?.action === 'auto_played') {
        toast({
          title: "Auto-played",
          description: `Rolled ${data.diceValue} — moved a piece`,
        });
      } else if (data?.action === 'auto_no_move') {
        toast({
          title: "No valid moves",
          description: `Rolled ${data.diceValue} — turn skipped`,
        });
      } else if (data?.action === 'aborted_or_finished') {
        toast({
          title: "Game ended",
          description: data?.winner ? `Winner: ${data.winner}` : "Game was aborted",
        });
      }

      // Allow time for the dice animation + pawn animation to be seen via realtime
      if (data?.action === 'auto_played') {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    } catch (error) {
      logger.debug('AutoPlay already triggered by another player');
    } finally {
      setIsAutoPlaying(false);
    }
  }, [gameId, isAutoPlaying, gameData?.status, gameData?.turn, currentPlayer?.color, toast]);

  // Log current game state for debugging - moved here to fix Rules of Hooks
  React.useEffect(() => {
    if (gameData && currentPlayer) {
      logger.debug('🎮 Game state update:', {
        gameId,
        currentPlayerColor: currentPlayer.color,
        gameDataTurn: gameData.turn,
        isMyTurn: isPlayerTurnSimple(currentPlayer?.color, gameData?.turn),
        isActiveGame: gameData?.status === 'active',
        dice: gameData.dice,
        timestamp: new Date().toISOString()
      });
    }
  }, [gameData?.turn, currentPlayer?.color, gameData?.dice, gameId]);

  // Clear stale animations when a new dice roll begins (new turn cycle)
  React.useEffect(() => {
    if (animatingPawn?.isComplete) {
      clearAnimation();
    }
  }, [gameData?.dice, gameData?.turn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize possible moves when game state changes (page reload, realtime updates)
  // Auto-skip turn if no valid moves available (only for the active player)
  React.useEffect(() => {
    const isMyTurnNow = isPlayerTurnSimple(currentPlayer?.color, gameData?.turn);
    const isGameActive = gameData?.status === 'active';
    
    if (isGameActive && isMyTurnNow && gameData?.dice !== null && gameData?.positions && currentPlayer?.color) {
      const moves = calculatePossibleMoves(gameData.dice, currentPlayer.color, gameData.positions);
      setPossibleMoves(moves);
      
      if (moves.length > 0) {
        setWaitingForMove(true);
      } else {
        setWaitingForMove(false);
        
        toast({
          title: "No moves available",
          description: "Your turn will be skipped...",
        });
        
        const skipTimeout = setTimeout(() => {
          if (!isPlayerTurnSimple(currentPlayer?.color, gameData?.turn)) return;
          
          supabase.functions.invoke('ludo-game', {
            body: { action: 'skip', gameId }
          }).then(({ data, error }) => {
            if (error) {
              logger.error('Failed to skip turn:', error);
            } else if (!data?.ok) {
              logger.error('Skip rejected:', data?.code, data?.error);
            }
          });
        }, 3000);
        
        return () => clearTimeout(skipTimeout);
      }
    } else if (!isMyTurnNow || gameData?.dice === null) {
      setPossibleMoves([]);
      setWaitingForMove(false);
    }
  }, [gameData?.dice, gameData?.turn, gameData?.positions, currentPlayer?.color, gameData?.status, gameId, toast]);

  // Synchronize clearAnimation with actual backend positions via realtime
  // Also clear on any position change after animation completes (handles edge cases)
  React.useEffect(() => {
    if (!animatingPawn || !animatingPawn.isComplete) return;
    if (!gameData?.positions) return;

    const color = animatingPawn.color;
    const pawnIndex = animatingPawn.pawnIndex;
    const targetPosition = animatingPawn.path[animatingPawn.path.length - 1];
    const currentPositions = gameData.positions[color];
    if (!currentPositions) return;

    const actualPosition = currentPositions[pawnIndex];

    if (actualPosition === targetPosition) {
      clearAnimation();
      return;
    }

    // Fallback: if positions changed but don't match target (e.g., server resolved differently),
    // still clear the animation after a short delay to avoid stuck state
    const fallback = setTimeout(() => {
      clearAnimation();
    }, 2000);
    return () => clearTimeout(fallback);
  }, [gameData?.positions, animatingPawn, clearAnimation]);

  // Remote movement detection - animate pawns for other players
  React.useEffect(() => {
    if (!gameData?.positions) {
      previousPositionsRef.current = null;
      return;
    }

    const currentPositions = gameData.positions;
    const prevPositions = previousPositionsRef.current;

    if (!prevPositions) {
      previousPositionsRef.current = JSON.parse(JSON.stringify(currentPositions));
      return;
    }

    if (isLocalMoveRef.current) {
      isLocalMoveRef.current = false;
      previousPositionsRef.current = JSON.parse(JSON.stringify(currentPositions));
      return;
    }

    // Detect the primary mover (the pawn that moved on the track, not a captured pawn)
    const colors: Color[] = ['R', 'G', 'Y', 'B'];
    let primaryMove: { color: Color; pawnIndex: number; from: number; to: number } | null = null;
    
    for (const color of colors) {
      const prev = prevPositions[color];
      const curr = currentPositions[color];
      if (!prev || !curr) continue;

      for (let pawnIndex = 0; pawnIndex < 4; pawnIndex++) {
        if (prev[pawnIndex] !== curr[pawnIndex]) {
          const movedForward = curr[pawnIndex] >= 0 || curr[pawnIndex] === 999 ||
            (curr[pawnIndex] >= 100 && curr[pawnIndex] < 500);
          
          // Prefer the pawn that moved forward on track/safe/goal (not one sent to prison)
          if (!primaryMove || movedForward) {
            primaryMove = { color, pawnIndex, from: prev[pawnIndex], to: curr[pawnIndex] };
            if (movedForward) break;
          }
        }
      }
      if (primaryMove && (primaryMove.to >= 0 || primaryMove.to === 999 ||
          (primaryMove.to >= 100 && primaryMove.to < 500))) break;
    }

    if (primaryMove) {
      const path = generatePath(primaryMove.from, primaryMove.to, primaryMove.color);
      const player = players.find(p => p.color === primaryMove!.color);
      if (player && path.length > 0) {
        startAnimation(player.id, primaryMove.pawnIndex, primaryMove.color, path);
        playPieceMoveSound();
      }
    }

    previousPositionsRef.current = JSON.parse(JSON.stringify(currentPositions));
  }, [gameData?.positions, players, startAnimation, playPieceMoveSound]);

  // Detect game finished and show winner modal
  useEffect(() => {
    if (gameData?.status === 'finished' && gameData?.winner && !showWinnerModal) {
      const winnerPlayer = playersWithUsernames.find(p => p.color === gameData.winner);
      
      if (winnerPlayer) {
        // Use bet_amount to determine if it's a free game
        // If bet_amount > 0, it's a paid game and we show the pot
        // If bet_amount = 0, it's a free game
        const isFreeGame = !gameData.bet_amount || gameData.bet_amount === 0;
        const potAmount = isFreeGame ? undefined : (gameData.pot ?? 0);
        
        setWinnerInfo({
          color: gameData.winner,
          name: winnerPlayer.username || winnerPlayer.first_name || 'Player',
          avatar: winnerPlayer.avatar_url,
          isMe: winnerPlayer.user_id === user?.id,
          potAmount
        });
        setShowWinnerModal(true);
      }
    }
  }, [gameData?.status, gameData?.winner, playersWithUsernames, players, user?.id, showWinnerModal, gameData?.bet_amount, gameData?.pot]);

  if (loading || isJoining) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p>{isJoining ? 'Connecting to game...' : 'Loading game...'}</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Game not found</h2>
          <p className="text-muted-foreground">This game does not exist or is no longer available.</p>
          <Button onClick={() => navigate('/games/ludo/create')}>
            Create a new game
          </Button>
        </div>
      </div>
    );
  }

  // Calculate responsive dimensions with maximized board size
  const isMobile = window.innerWidth < 768;
  const horizontalPadding = 0; // Eliminate horizontal padding completely
  const verticalOffset = isMobile ? 120 : 100; // Account for fixed header
  
  const availableWidth = window.innerWidth - horizontalPadding;
  const availableHeight = window.innerHeight - verticalOffset;
  
  // Prioritize width for maximum board size, especially on mobile
  const boardSize = isMobile ? availableWidth : Math.min(availableWidth, availableHeight);
  const cellSize = Math.floor(boardSize / 15); // Use 15 to exclude header space

  const isMyTurn = isPlayerTurnSimple(currentPlayer?.color, gameData?.turn);
  const isSpectator = !currentPlayer && !!user;

  const waitingRoomCurrent =
    playersWithUsernames.find((p) => user?.id && p.user_id === user.id) ?? null;

  const handleDiceRolled = (diceValue: number) => {
    if (!currentPlayer || !gameData?.positions) return;
    
    const moves = calculatePossibleMoves(diceValue, currentPlayer.color, gameData.positions);
    setPossibleMoves(moves);
    setWaitingForMove(moves.length > 0);
  };


  // handlePawnClick is now provided by useLudoGameActions hook
  
  
  // Find player by color helper
  const getPlayerByColor = (color: 'R' | 'G' | 'Y' | 'B') => {
    return playersWithUsernames.find(p => p.color === color);
  };

  // Show waiting room UI when game is in 'created' status
  if (gameData?.status === 'created') {
    return (
      <LudoWaitingRoom
        gameId={gameId || ''}
        roomCode={gameData.room_code}
        betAmount={gameData.bet_amount || 0}
        maxPlayers={gameData.max_players ?? 4}
        players={playersWithUsernames}
        currentPlayer={waitingRoomCurrent}
        isCreator={user?.id === gameData.created_by}
        onStartGame={handleStartGame}
        isStartingGame={hookIsStarting}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-background text-foreground relative overflow-hidden p-0 m-0">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        
        <div className="relative w-full h-full flex flex-col">
          {/* Premium Gaming HUD */}
          <LudoGameHUD
            roomCode={gameData?.room_code}
            isOnline={isOnline}
            isSpectator={isSpectator}
            isLeaving={isLeaving}
            betAmount={gameData?.bet_amount || 0}
            onExit={() => user && gameId && leaveGame(gameId, user.id)}
            onBack={() => navigate('/games/ludo', { replace: true })}
            onShare={() => setShowShareModal(true)}
          >
            {/* Floating Controls - Timer, Dice, Pot */}
            <FloatingGameControls
              turnStartedAt={gameData?.turn_started_at}
              currentTurn={gameData?.turn}
              isCurrentTurn={isMyTurn}
              onTimeExpired={handleTimeExpired}
              gameId={gameId || ''}
              currentPlayerColor={gameData?.turn}
              isPlayerTurn={currentPlayer?.color === gameData?.turn}
              diceValue={gameData?.dice}
              isGameActive={gameData?.status === 'active'}
              onDiceRolled={handleDiceRolled}
              isSpectator={isSpectator}
              potAmount={gameData?.pot ?? (gameData?.bet_amount || 0) * players.length}
              betAmount={gameData?.bet_amount || 0}
            />
          </LudoGameHUD>

          {/* Game Board with Profile Cards - adjusted for minimal header */}
          <div 
            className="flex-1 flex items-center justify-center px-0 sm:px-4"
            style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
          >
            <div className="relative w-full sm:w-auto">
              {/* Top Profile Cards */}
              <div className="absolute -top-8 left-0 right-0 flex justify-between px-1 sm:px-0 z-40">
                <PlayerProfileCard
                  player={getPlayerByColor('R')}
                  color="R"
                  isCurrentTurn={gameData?.turn === 'R'}
                />
                <PlayerProfileCard
                  player={getPlayerByColor('G')}
                  color="G"
                  isCurrentTurn={gameData?.turn === 'G'}
                  reverse
                />
              </div>

              {/* Board Canvas */}
              <div 
                className="aspect-square w-full sm:w-auto"
                style={{
                  width: 'min(100vw, calc(100vh - 12rem))',
                  height: 'min(100vw, calc(100vh - 12rem))',
                  maxWidth: '100vw',
                }}
              >
                <BoardKonva 
                  cellSize={cellSize}
                  padding={0}
                  showHeaders={false}
                  players={playersWithUsernames}
                  gamePositions={gameData?.positions}
                  possibleMoves={possibleMoves}
                  onPawnClick={handlePawnClick}
                  isMoving={isMoving}
                  currentTurn={gameData?.turn}
                  animatingPawn={animatingPawn}
                />
              </div>

              {/* Bottom Profile Cards */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between z-40">
                <PlayerProfileCard
                  player={getPlayerByColor('B')}
                  color="B"
                  isCurrentTurn={gameData?.turn === 'B'}
                />
                <PlayerProfileCard
                  player={getPlayerByColor('Y')}
                  color="Y"
                  isCurrentTurn={gameData?.turn === 'Y'}
                  reverse
                />
              </div>
            </div>
          </div>

          {/* Share Modal */}
          {gameData && (
            <ShareGameModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              gameId={gameData.id}
              roomCode={gameData.room_code}
              currentPlayers={gameData.current_players}
              maxPlayers={gameData.max_players}
            />
          )}

          {/* Winner Modal */}
          <WinnerModal
            isOpen={showWinnerModal}
            gameId={gameId || ''}
            winnerColor={winnerInfo?.color || 'R'}
            winnerName={winnerInfo?.name || 'Winner'}
            winnerAvatar={winnerInfo?.avatar}
            isCurrentUserWinner={winnerInfo?.isMe || false}
            potAmount={winnerInfo?.potAmount}
            claimStatus={gameData.claim_status}
            claimTxHash={gameData.claim_tx_hash}
            onPlayAgain={() => navigate('/games/ludo/create', { replace: true })}
            onBackToGames={() => navigate('/games/ludo', { replace: true })}
          />
        </div>
      </div>
    </div>
  );
};

export default LudoKonva;