import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
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
  React.useEffect(() => {
    const allFourConfirmed = players.length === 4 && 
      players.every(p => p.deposit_status === 'confirmed' || p.deposit_status === 'free');
    
    if (allFourConfirmed && !isStartingGame) {
      onStartGame();
    }
  }, [players, isStartingGame, onStartGame]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WaitingRoomHeader
        gameId={gameId}
        userId={user?.id || ''}
        roomCode={roomCode}
        betAmount={betAmount}
        onShare={() => setShowShareModal(true)}
      />

      <div className="flex-1 flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          {/* Pot Display */}
          {!isFreeGame && (
            <PotDisplay
              betAmount={betAmount}
              confirmedPlayers={playersReadyCount}
              totalPlayers={4}
            />
          )}

          {/* Deposit Section - 3 states */}
          {!isFreeGame && !currentPlayerConfirmed && !currentPlayerPending && (
            <DepositButton
              betAmount={betAmount}
              hasDeposited={currentPlayerConfirmed}
              onDepositSuccess={handleDepositSuccess}
              gameId={gameId}
              userId={user?.id}
            />
          )}

          {/* Pending transaction message */}
          {!isFreeGame && currentPlayerPending && (
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-orange-500 font-medium">Transaction pending...</p>
              </div>
              <p className="text-sm text-muted-foreground">Waiting for blockchain confirmation</p>
            </div>
          )}

          {/* Deposit confirmed message */}
          {!isFreeGame && currentPlayerConfirmed && (
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-green-500 font-medium">Deposit confirmed</p>
              <p className="text-sm text-muted-foreground">Waiting for other players...</p>
            </div>
          )}

          {/* Free game message */}
          {isFreeGame && (
            <div className="text-center py-8">
              <p className="text-lg font-medium">Free game</p>
              <p className="text-sm text-muted-foreground mt-1">
                No deposit required
              </p>
            </div>
          )}

          {/* Players List */}
          <WaitingPlayersList
            players={waitingPlayers}
            maxPlayers={4}
          />

          {/* Start Game Button - Only for creator when all ready */}
          {isCreator && (
            <Button
              onClick={onStartGame}
              disabled={!allPlayersReady || isStartingGame || players.length < 2}
              className="w-full h-12 text-base font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              {isStartingGame ? 'Starting...' : 'Start game'}
            </Button>
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
        </div>
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
