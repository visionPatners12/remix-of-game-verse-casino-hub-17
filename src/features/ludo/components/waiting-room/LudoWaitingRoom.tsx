import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaitingRoomHeader } from './WaitingRoomHeader';
import { DepositButton } from './DepositButton';
import { WaitingPlayersList } from './WaitingPlayersList';
import { PotDisplay } from './PotDisplay';
import { ShareGameModal } from '../../components/ShareGameModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WaitingRoomPlayer {
  id: string;
  user_id: string;
  color: string;
  is_ready: boolean;
  username?: string;
  avatar_url?: string;
  tx_hash?: string;
  deposit_status?: string;
}

interface LudoWaitingRoomProps {
  gameId: string;
  roomCode: string;
  betAmount: number;
  players: WaitingRoomPlayer[];
  currentPlayer: WaitingRoomPlayer | null;
  isCreator: boolean;
  onStartGame: () => void;
  isStartingGame?: boolean;
}

// Floating dice decoration

// Floating dice decoration
const FloatingDice: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute top-20 left-10 text-4xl opacity-10"
      animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      🎲
    </motion.div>
    <motion.div
      className="absolute top-40 right-8 text-3xl opacity-10"
      animate={{ y: [10, -10, 10], rotate: [0, -10, 10, 0] }}
      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
    >
      🎲
    </motion.div>
    <motion.div
      className="absolute bottom-32 left-1/4 text-5xl opacity-5"
      animate={{ y: [-5, 15, -5], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay: 2 }}
    >
      🎲
    </motion.div>
  </div>
);

export const LudoWaitingRoom: React.FC<LudoWaitingRoomProps> = ({
  gameId,
  roomCode,
  betAmount,
  players,
  currentPlayer,
  isCreator,
  onStartGame,
  isStartingGame = false,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Map players to waiting room format with deposit status
  const waitingPlayers = players.map(p => ({
    ...p,
    has_deposited: p.deposit_status === 'confirmed' || p.deposit_status === 'free' || p.is_ready,
    deposit_status: p.deposit_status,
  }));

  const currentPlayerPending = currentPlayer?.deposit_status === 'pending' && currentPlayer?.tx_hash;
  const currentPlayerConfirmed = currentPlayer?.deposit_status === 'confirmed' || currentPlayer?.deposit_status === 'free' || currentPlayer?.is_ready;
  const allPlayersReady = waitingPlayers.length >= 2 && waitingPlayers.every(p => p.has_deposited);
  const playersReadyCount = waitingPlayers.filter(p => p.has_deposited).length;

  const isFreeGame = betAmount <= 0;

  const handleDepositSuccess = async (txHash: string) => {
    if (!user || !currentPlayer) return;

    try {
      // Update player to PENDING with tx_hash (backend will confirm later)
      const { error: updateError } = await supabase
        .from('ludo_game_players')
        .update({
          tx_hash: txHash,
          deposit_status: 'pending',
        } as any)
        .eq('game_id', gameId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating player deposit:', updateError);
        toast({
          title: "Error",
          description: "Failed to register transaction.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Transaction sent!",
        description: "Waiting for blockchain confirmation...",
      });
    } catch (error) {
      console.error('Deposit success handler error:', error);
    }
  };


  // Auto-start when all 4 players are confirmed
  useEffect(() => {
    const allFourConfirmed = players.length === 4 && 
      players.every(p => p.deposit_status === 'confirmed' || p.deposit_status === 'free');
    
    if (allFourConfirmed && !isStartingGame) {
      onStartGame();
    }
  }, [players, isStartingGame, onStartGame]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative ludo-pattern-bg">
      {/* Floating decorations */}
      <FloatingDice />


      <WaitingRoomHeader
        gameId={gameId}
        userId={user?.id || ''}
        roomCode={roomCode}
        betAmount={betAmount}
        onShare={() => setShowShareModal(true)}
      />

      <div className="flex-1 flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Pot Display */}
          {!isFreeGame && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <PotDisplay
                betAmount={betAmount}
                confirmedPlayers={playersReadyCount}
                totalPlayers={4}
              />
            </motion.div>
          )}

          {/* Deposit Section - 3 states */}
          {!isFreeGame && !currentPlayerConfirmed && !currentPlayerPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <DepositButton
                betAmount={betAmount}
                hasDeposited={currentPlayerConfirmed}
                onDepositSuccess={handleDepositSuccess}
                gameId={gameId}
                userId={user?.id}
              />
            </motion.div>
          )}

          {/* Pending transaction message */}
          {!isFreeGame && currentPlayerPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-orange-500 font-medium">Transaction pending...</p>
              </div>
              <p className="text-sm text-muted-foreground">Waiting for blockchain confirmation</p>
            </motion.div>
          )}

          {/* Deposit confirmed message */}
          {!isFreeGame && currentPlayerConfirmed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-500/30 bg-green-500/10"
            >
              <p className="text-green-500 font-medium">✓ Deposit confirmed</p>
              <p className="text-sm text-muted-foreground">Waiting for other players...</p>
            </motion.div>
          )}

          {/* Free game message */}
          {isFreeGame && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-lg font-medium">Free game</p>
              <p className="text-sm text-muted-foreground mt-1">
                No deposit required
              </p>
            </motion.div>
          )}

          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WaitingPlayersList
              players={waitingPlayers}
              maxPlayers={4}
            />
          </motion.div>

          {/* Start Game Button - Only for creator when all ready */}
          {isCreator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={onStartGame}
                disabled={!allPlayersReady || isStartingGame || players.length < 2}
                className="w-full h-12 text-base font-semibold gap-2"
              >
                <Play className="w-5 h-5" />
                {isStartingGame ? 'Starting...' : 'Start game'}
              </Button>
            </motion.div>
          )}

          {/* Info message */}
          {!isCreator && (
            <p className="text-center text-sm text-muted-foreground">
              Waiting for the host to start the game...
            </p>
          )}

          {isCreator && players.length < 2 && (
            <p className="text-center text-sm text-muted-foreground">
              Minimum 2 players to start
            </p>
          )}
        </motion.div>
      </div>

      {/* Share Modal */}
      <ShareGameModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameId={gameId}
        roomCode={roomCode}
        currentPlayers={players.length}
        maxPlayers={4}
      />
    </div>
  );
};
