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
import { isInEnemyPrison } from '../model/movement';
import type { Color } from '../model/ludoModel';
import type { UIMove } from '../types';
import { START_INDEX, HOME_BASE, GOAL, canEnterSafe, SAFE_BASE, SAFE_LEN, TRACK_LEN } from '../model/ludoModel';
import { generatePath } from '../utils/pathGenerator';
import { validateTurnWithRetry, isPlayerTurnSimple } from '../utils/turnValidation';
import { logger } from '@/utils/logger';
import '../styles/dice.css';

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
  const { gameData, players, currentPlayer, loading, toggleReady, isOnline } = useRealtimeGame(gameId || '');
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

  // Auto-play handler when timer expires
  const handleTimeExpired = useCallback(async () => {
    if (isAutoPlaying || gameData?.status !== 'active') return;
    
    setIsAutoPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { action: 'autoPlay', gameId }
      });

      if (error) {
        logger.debug('AutoPlay error:', error);
      } else if (!data?.ok) {
        // Handle backend error response
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

  // Synchronize possible moves when game state changes (page reload, realtime updates)
  // Auto-skip turn if no valid moves available
  React.useEffect(() => {
    const isMyTurnNow = isPlayerTurnSimple(currentPlayer?.color, gameData?.turn);
    const isGameActive = gameData?.status === 'active';
    
    if (isGameActive && isMyTurnNow && gameData?.dice !== null && gameData?.positions && currentPlayer?.color) {
      const moves = calculatePossibleMoves(gameData.dice, currentPlayer.color, gameData.positions);
      setPossibleMoves(moves);
      
      if (moves.length > 0) {
        setWaitingForMove(true);
        logger.debug('🔄 Synced possible moves on state change:', {
          dice: gameData.dice,
          color: currentPlayer.color,
          movesCount: moves.length,
          moves: moves.map(m => ({ pawn: m.pawnIndex, target: m.target }))
        });
      } else {
        // No valid moves available → auto-skip turn after a short delay
        setWaitingForMove(false);
        logger.debug('⏭️ No valid moves available, will auto-skip in 2 seconds...', {
          dice: gameData.dice,
          color: currentPlayer.color
        });
        
        // Show immediate feedback that no moves are available
        toast({
          title: "No moves available",
          description: "Your turn will be skipped in 2 seconds...",
        });
        
        // Delay before auto-skip to let player see the situation
        const skipTimeout = setTimeout(() => {
          // Skip without animating the dice
          supabase.functions.invoke('ludo-game', {
            body: { action: 'skip', gameId }
          }).then(({ data, error }) => {
            if (error) {
              logger.error('❌ Failed to skip turn:', error);
              toast({
                title: "Error",
                description: "Failed to skip turn",
                variant: "destructive"
              });
            } else if (!data?.ok) {
              logger.error('❌ Skip rejected:', data?.code, data?.error);
              toast({
                title: "Error",
                description: data?.error || "Failed to skip turn",
                variant: "destructive"
              });
            } else {
              logger.debug('✅ Turn skipped successfully:', data);
              // Handle game end if skip triggered finish
              if (data.finished && data.winner) {
                logger.debug('🏆 Game finished after skip:', data.winner);
              }
            }
          });
        }, 2000);
        
        // Cleanup timeout if component unmounts or dependencies change
        return () => clearTimeout(skipTimeout);
      }
    } else if (!isMyTurnNow || gameData?.dice === null) {
      setPossibleMoves([]);
      setWaitingForMove(false);
    }
  }, [gameData?.dice, gameData?.turn, gameData?.positions, currentPlayer?.color, gameData?.status, gameId, toast]);

  // Synchronize clearAnimation with actual backend positions via realtime
  React.useEffect(() => {
    if (!animatingPawn || !animatingPawn.isComplete) return;
    if (!gameData?.positions) return;

    const color = animatingPawn.color;
    const pawnIndex = animatingPawn.pawnIndex;
    const targetPosition = animatingPawn.path[animatingPawn.path.length - 1];

    const currentPositions = gameData.positions[color];
    if (!currentPositions) return;

    const actualPosition = currentPositions[pawnIndex];

    // If the actual position matches the animation target, clear the animation
    if (actualPosition === targetPosition) {
      logger.debug('✅ Positions synced, clearing animation:', {
        color,
        pawnIndex,
        targetPosition,
        actualPosition
      });
      clearAnimation();
    }
  }, [gameData?.positions, animatingPawn, clearAnimation]);

  // Remote movement detection - animate pawns for other players
  React.useEffect(() => {
    if (!gameData?.positions) {
      previousPositionsRef.current = null;
      return;
    }

    const currentPositions = gameData.positions;
    const prevPositions = previousPositionsRef.current;

    // First load - just save positions
    if (!prevPositions) {
      previousPositionsRef.current = JSON.parse(JSON.stringify(currentPositions));
      return;
    }

    // If this was a local move, skip remote animation (we already animated)
    if (isLocalMoveRef.current) {
      isLocalMoveRef.current = false;
      previousPositionsRef.current = JSON.parse(JSON.stringify(currentPositions));
      return;
    }

    // Detect which pawn moved by comparing positions
    const colors: Color[] = ['R', 'G', 'Y', 'B'];
    let foundMove = false;
    
    for (const color of colors) {
      if (foundMove) break; // Exit outer loop if move already found
      
      const prev = prevPositions[color];
      const curr = currentPositions[color];
      if (!prev || !curr) continue;

      for (let pawnIndex = 0; pawnIndex < 4; pawnIndex++) {
        if (prev[pawnIndex] !== curr[pawnIndex]) {
          foundMove = true; // Mark as found to exit both loops
          
          // Movement detected! Generate path and animate
          const path = generatePath(prev[pawnIndex], curr[pawnIndex], color);
          
          // Find the player for this color
          const player = players.find(p => p.color === color);
          if (player && path.length > 0) {
            logger.debug('🎬 Remote movement detected, animating:', {
              color,
              pawnIndex,
              from: prev[pawnIndex],
              to: curr[pawnIndex],
              pathLength: path.length
            });
            startAnimation(player.id, pawnIndex, color, path);
            playPieceMoveSound();
          }
          break; // Exit inner loop
        }
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
  }, [gameData?.status, gameData?.winner, playersWithUsernames, players, user?.id, showWinnerModal, gameData?.bet_amount]);

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

  // Helper for checking if pawn is at home
  const isAtHome = (position: number, color: Color): boolean => {
    const base = HOME_BASE[color]; // {R:-10,G:-20,Y:-30,B:-40}
    // tolérant: -20..-17 ou -20..-23 selon conventions
    return (position >= base && position <= base + 3) || (position <= base && position >= base - 3);
  };

  // Helper for color display
  const getColorName = (color: string) => {
    const colorNames = {
      'R': 'RED',
      'G': 'GREEN', 
      'Y': 'YELLOW',
      'B': 'BLUE'
    };
    return colorNames[color as keyof typeof colorNames] || color;
  };

  // Enhanced turn validation with fallback
  const isMyTurn = isPlayerTurnSimple(currentPlayer?.color, gameData?.turn);
  const isActiveGame = gameData?.status === 'active';
  const isSpectator = !currentPlayer && !!user;

  // Calculate possible moves after dice roll with target information
  const calculatePossibleMoves = (diceValue: number, playerColor: string, positions: any): UIMove[] => {
    if (!positions || !playerColor) return [];
    
    const playerPositions: number[] = positions[playerColor] ?? [-10, -11, -12, -13]; // fallback
    const res: UIMove[] = [];
    
    logger.debug('🎲 calculatePossibleMoves:', { diceValue, playerColor, positions: playerPositions, safeBase: SAFE_BASE[playerColor as Color] });
    
    for (let i = 0; i < 4; i++) {
      const pos = playerPositions[i];

      // 1) PRISON ADVERSE → sortie sur 6 vers HOME (backend calcule position libre)
      if (isInEnemyPrison(pos, playerColor as Color) && diceValue === 6) {
        res.push({
          pawnIndex: i,
          from: 'prison',
          canExit: true,
          target: null, // Backend trouve position HOME libre
        });
        continue;
      }

      // 2) HOME → sortie sur 6 vers START_INDEX  
      if (isAtHome(pos, playerColor as Color) && diceValue === 6) {
        res.push({
          pawnIndex: i,
          from: 'home',
          canExit: true,
          target: START_INDEX[playerColor as Color],
        });
        continue;
      }

      // 3) COULOIR DE SÉCURITÉ (100-105, 200-205, 300-305, 400-405) → mouvement vers GOAL ou avance
      const safeBase = SAFE_BASE[playerColor as Color];
      if (pos >= safeBase && pos < safeBase + SAFE_LEN) {
        const safeIndex = pos - safeBase; // 0 à 5
        const newSafeIndex = safeIndex + diceValue;
        
        if (newSafeIndex === SAFE_LEN) {
          // Arrivée exacte au GOAL
          res.push({ pawnIndex: i, from: 'track', canExit: false, target: GOAL });
        } else if (newSafeIndex < SAFE_LEN) {
          // Avance dans le couloir
          res.push({ pawnIndex: i, from: 'track', canExit: false, target: safeBase + newSafeIndex });
        }
        // Si newSafeIndex > SAFE_LEN → dépassement, pas de mouvement possible
        continue;
      }

      // 4) Sur la piste (0-55) → mouvement normal avec canEnterSafe
      if (pos >= 0 && pos < TRACK_LEN) {
        try {
          const info = canEnterSafe(playerColor as Color, pos, diceValue);
          if ((info as any).invalid) {
            // aucun move si dépassement du couloir
          } else if ((info as any).enter && (info as any).goal) {
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: GOAL });
          } else if ((info as any).enter && typeof (info as any).safeTo === 'number') {
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: (info as any).safeTo });
          } else if (typeof (info as any).loopTo === 'number') {
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: (info as any).loopTo });
          } else {
            // fallback minimaliste
            res.push({ pawnIndex: i, from: 'track', canExit: false, target: null });
          }
        } catch {
          // si erreur, on tombe en simple
          res.push({ pawnIndex: i, from: 'track', canExit: false, target: null });
        }
      }
    }
    return res;
  };

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
        players={playersWithUsernames}
        currentPlayer={currentPlayer as any}
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
                  isMoving={isMoving || isAnimating}
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
            claimStatus={(gameData as any)?.claim_status}
            claimTxHash={(gameData as any)?.claim_tx_hash}
            onPlayAgain={() => navigate('/games/ludo/create', { replace: true })}
            onBackToGames={() => navigate('/games/ludo', { replace: true })}
          />
        </div>
      </div>
    </div>
  );
};

export default LudoKonva;