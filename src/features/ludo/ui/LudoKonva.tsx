import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Share, Play, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/useGameSounds';
import { supabase } from '@/integrations/supabase/client';
import { BoardKonva } from '@/features/ludo';

import { ShareGameModal } from '../components/ShareGameModal';
import { PlayerProfileCard } from '../components/PlayerProfileCard';
import { DiceRoller } from '../components/DiceRoller';
import { TurnTimer } from '../components/TurnTimer';
import { WinnerModal } from '../components/WinnerModal';
import { NetworkIndicator } from '../components/NetworkIndicator';
import { PrizePoolBadge } from '../components/PrizePoolBadge';
import { useLeaveGame } from '../hooks/useLeaveGame';
import { LudoWaitingRoom } from '../components/waiting-room';
import { useAutoJoin } from '../hooks/useAutoJoin';
import { useRealtimeGame } from '../hooks/useRealtimeGame';
import { usePlayersWithUsernames } from '../hooks/usePlayersWithUsernames';
import { usePawnAnimation } from '../hooks/usePawnAnimation';
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
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [waitingForMove, setWaitingForMove] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<UIMove[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [skipRollTrigger, setSkipRollTrigger] = useState(0);
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
  // Move clickTimeoutRef to top with other hooks
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          // Trigger dice animation before calling skip
          setSkipRollTrigger(prev => prev + 1);
          
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

  const startGame = async () => {
    if (!gameData || !user || gameData.created_by !== user.id) return;
    
    setIsStartingGame(true);
    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { action: 'start', gameId }
      });

      if (error) throw error;

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
  };

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


  const handlePawnClickInternal = async (playerId: string, pawnIndex: number) => {
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
      isGameActive: isActiveGame,
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

    // Calculer la position de départ actuelle
    const playerPositions = gameData?.positions?.[currentPlayer.color as Color] ?? [];
    const currentPos = playerPositions[pawnIndex];
    
    // Générer le chemin pour l'animation
    const targetPos = move.target ?? START_INDEX[currentPlayer.color as Color];
    const path = generatePath(currentPos, targetPos, currentPlayer.color as Color);
    
    logger.debug('🚶 Animation path:', { currentPos, targetPos, path });

    // Démarrer l'animation et attendre qu'elle finisse
    if (path.length > 0) {
      playPieceMoveSound();
      await startAnimation(playerId, pawnIndex, currentPlayer.color as Color, path);
    }

    try {
      const { data, error } = await supabase.functions.invoke('ludo-game', {
        body: { 
          action: 'move',
          gameId: gameId,
          pawnIndex: pawnIndex
        }
      });

      if (error) throw error;

      // Check for backend error response
      if (!data?.ok) {
        const errorCode = data?.code;
        const errorMessage = data?.error || 'Move failed';
        
        if (errorCode === 'FORBIDDEN') {
          throw new Error(errorMessage);
        } else if (errorCode === 'BAD_STATE') {
          throw new Error(errorMessage);
        } else if (errorCode === 'INVALID_MOVE') {
          throw new Error(errorMessage);
        }
        throw new Error(errorMessage);
      }

      // Animation sera effacée par le useEffect quand les positions realtime seront synchronisées
      logger.debug('✅ Move successful, waiting for realtime sync:', data);

      // Don't rely on data.newPositions - let realtime sync handle position updates
      // Just clear the move state and let the next dice roll calculate new moves
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
      // En cas d'erreur, effacer l'animation aussi
      clearAnimation();
      logger.error('❌ Move failed:', error);
      
      // Check if it's a "Not your turn" error that might be a sync issue
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const isNotYourTurnError = errorMessage.includes('Not your turn');
      
      if (isNotYourTurnError) {
        toast({
          title: "Sync error",
          description: "Game data not synchronized. Please wait and retry.",
          variant: "destructive"
        });
        
        // Force refresh game state in a few seconds
        setTimeout(() => {
          logger.debug('🔄 Attempting to refresh game state after sync error');
        }, 2000);
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
  };

  // Debounced version to prevent double-clicks
  const handlePawnClick = (playerId: string, pawnIndex: number) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      handlePawnClickInternal(playerId, pawnIndex);
    }, 100);
  };
  
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
        onStartGame={startGame}
        isStartingGame={isStartingGame}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-background text-foreground relative overflow-hidden p-0 m-0">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        
        <div className="relative w-full h-full flex flex-col">
          {/* Mobile-first Header */}
          <div 
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            {/* Spectator banner */}
            {isSpectator && (
              <div className="bg-muted/80 text-muted-foreground text-center py-1.5 text-xs font-medium border-b border-border/20 flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>View Mode</span>
              </div>
            )}
            
            {/* Row 1: Exit/Back + Game name + Share */}
            <div className="flex items-center justify-between px-3 py-2">
              {isSpectator ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/games/ludo')}
                  className="gap-1.5 h-8 px-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs">Back</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => user && gameId && leaveGame(gameId, user.id)}
                  disabled={isLeaving}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 px-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs">Exit</span>
                </Button>
              )}

              {/* Game name + Room code */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
                  {gameData?.game_name || 'Ludo'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {gameData?.room_code}
                  </span>
                  <NetworkIndicator isOnline={isOnline} />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareModal(true)}
                className="w-8 h-8 rounded-full hover:bg-muted"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>

            {/* Row 2: Timer + Dice + Players count */}
            <div className="flex items-center justify-between px-3 pb-2 gap-3">
              {/* Timer */}
              <TurnTimer 
                turnStartedAt={gameData?.turn_started_at}
                currentTurn={gameData?.turn}
                turnDuration={30}
                isCurrentTurn={isMyTurn}
                onTimeExpired={handleTimeExpired}
              />

              {/* Dice - centered (disabled for spectators) */}
              <DiceRoller
                gameId={gameId || ''}
                currentTurn={gameData?.turn || ''}
                currentPlayerColor={gameData?.turn}
                isPlayerTurn={!isSpectator && currentPlayer?.color === gameData?.turn}
                diceValue={gameData?.dice}
                isGameActive={gameData?.status === 'active'}
                onDiceRolled={handleDiceRolled}
                triggerRoll={skipRollTrigger}
              />

              {/* Prize Pool */}
              <PrizePoolBadge
                betAmount={gameData?.bet_amount || 0}
                pot={gameData?.pot}
                playersCount={players.length}
              />
            </div>
          </div>

          {/* Game Board with Profile Cards - adjusted for fixed header */}
          <div 
            className="flex-1 flex items-center justify-center px-0 sm:px-4 pb-4"
            style={{ paddingTop: 'calc(8rem + env(safe-area-inset-top))' }}
          >
            <div className="relative w-full sm:w-auto">
              {/* Top Profile Cards - aligned with canvas edges */}
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

              {/* Board Canvas - full width on mobile, adjusted for header */}
              <div 
                className="aspect-square w-full sm:w-auto"
                style={{
                  width: 'min(100vw, calc(100vh - 16rem))',
                  height: 'min(100vw, calc(100vh - 16rem))',
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

              {/* Bottom Profile Cards - aligned with canvas edges */}
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
            onPlayAgain={() => navigate('/games/ludo/create')}
            onBackToGames={() => navigate('/games/ludo')}
          />
        </div>
      </div>
    </div>
  );
};

export default LudoKonva;