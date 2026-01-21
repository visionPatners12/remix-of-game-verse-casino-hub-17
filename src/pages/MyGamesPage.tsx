import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, Trophy, Clock, Users, Loader2, Play, ChevronRight, RefreshCw, Wallet, CheckCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/features/auth';
import { useUserActiveGame } from '@/features/ludo/hooks/useUserActiveGame';
import { useUserPastGames, ClaimStatus } from '@/features/ludo/hooks/useUserPastGames';
import { useClaimPrize } from '@/features/ludo/hooks/useClaimPrize';
import { Button } from '@/components/ui/button';
import { useHideNavigation } from '@/hooks/useHideNavigation';
import { cn } from '@/lib/utils';
const MyGamesPage: React.FC = () => {
  useHideNavigation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeGame, loading: activeLoading } = useUserActiveGame(user?.id);
  const { games: pastGames, loading: pastLoading, error, refetch } = useUserPastGames(user?.id);
  const { claimPrize, isPending: isClaimPending } = useClaimPrize();
  const [claimingGameId, setClaimingGameId] = useState<string | null>(null);

  const isLoading = activeLoading || pastLoading;

  // Stats calculation
  const totalGames = pastGames.length;
  const wins = pastGames.filter(g => g.isWinner).length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const totalWinnings = pastGames
    .filter(g => g.isWinner && g.pot)
    .reduce((sum, g) => sum + (g.pot || 0) * 0.9, 0); // 90% net prize

  const handleClaimRetry = async (gameId: string) => {
    setClaimingGameId(gameId);
    const game = pastGames.find(g => g.id === gameId);
    const isRetry = game?.claim_status !== null;
    await claimPrize(gameId, isRetry);
    setClaimingGameId(null);
    // Refetch to update status
    setTimeout(() => refetch(), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">My Ludo Games</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <p className="text-2xl font-bold text-foreground">{totalGames}</p>
            <p className="text-xs text-muted-foreground">Games</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <p className="text-2xl font-bold text-success">{winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">${totalWinnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
        </div>

        {/* Active Game */}
        {activeLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : activeGame ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Active Game
            </h2>
            <button
              onClick={() => navigate(`/games/ludo/play/${activeGame.id}`)}
              className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">
                  {activeGame.game_name || `Game #${activeGame.room_code}`}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-medium capitalize">{activeGame.status}</span>
                  {activeGame.bet_amount && activeGame.bet_amount > 0 && (
                    <span>• ${activeGame.bet_amount}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>
          </motion.div>
        ) : null}

        {/* Past Games */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Game History ({pastGames.length})
          </h2>

          {pastLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : pastGames.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No games played yet</p>
              <Button
                onClick={() => navigate('/games/ludo')}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Now
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {pastGames.map((game, index) => (
                  <GameHistoryCard 
                    key={game.id} 
                    game={game} 
                    index={index} 
                    onClaimRetry={handleClaimRetry}
                    isClaimingGame={isClaimPending ? claimingGameId : null}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Play Button */}
        {!activeGame && pastGames.length > 0 && (
          <div className="pt-4">
            <Button
              onClick={() => navigate('/games/ludo')}
              className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Gamepad2 className="h-5 w-5 mr-2" />
              Play Ludo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface GameHistoryCardProps {
  game: {
    id: string;
    room_code: string | null;
    game_name: string | null;
    pot: number | null;
    bet_amount: number | null;
    finished_at: string | null;
    isWinner: boolean;
    claim_status: ClaimStatus;
    claim_tx_hash: string | null;
    players: Array<{
      id: string;
      color: string;
      users: { username: string | null; avatar_url: string | null } | null;
    }>;
    winnerUser: { username: string | null; avatar_url: string | null } | null;
  };
  index: number;
  onClaimRetry: (gameId: string) => void;
  isClaimingGame: string | null;
}

const GameHistoryCard: React.FC<GameHistoryCardProps> = ({ game, index, onClaimRetry, isClaimingGame }) => {
  const [showRetryForPending, setShowRetryForPending] = useState(false);
  
  const timeAgo = game.finished_at
    ? formatDistanceToNow(new Date(game.finished_at), { addSuffix: true })
    : 'Unknown';

  const playerCount = game.players?.length || 0;
  const netPrize = game.pot ? game.pot * 0.9 : 0;
  
  const isClaimPending = game.claim_status === 'received' || game.claim_status === 'pending_confirmations';
  const isClaimConfirmed = game.claim_status === 'confirmed';
  const isClaimFailed = game.claim_status === 'mismatch' || game.claim_status === 'reverted' || game.claim_status === 'timeout';
  const canClaim = game.isWinner && game.pot && game.pot > 0 && !game.claim_status;
  const isClaiming = isClaimingGame === game.id;

  // Timer to show retry button after 30 seconds for pending claims
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isClaimPending) {
      timer = setTimeout(() => {
        setShowRetryForPending(true);
      }, 30000);
    } else {
      setShowRetryForPending(false);
    }
    
    return () => clearTimeout(timer);
  }, [isClaimPending]);

  const showRetryButton = isClaimFailed || showRetryForPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "p-4 rounded-xl border",
        game.isWinner
          ? 'bg-success/5 border-success/20'
          : 'bg-card border-border/50'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Result icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            game.isWinner
              ? 'bg-success/20 text-success'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {game.isWinner ? (
            <Trophy className="w-5 h-5" />
          ) : (
            <Gamepad2 className="w-5 h-5" />
          )}
        </div>

        {/* Game info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">
              #{game.room_code || 'N/A'}
            </span>
            {game.isWinner && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-success/20 text-success uppercase">
                Won
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {playerCount}
            </span>
          </div>
        </div>

        {/* Prize/bet info */}
        {game.pot && game.pot > 0 ? (
          <div className="text-right flex-shrink-0">
            <span
              className={cn(
                "text-sm font-bold",
                game.isWinner ? 'text-success' : 'text-muted-foreground'
              )}
            >
              {game.isWinner ? '+' : '-'}${game.isWinner ? netPrize.toFixed(0) : (game.bet_amount || 0)}
            </span>
            <p className="text-[10px] text-muted-foreground">
              Pot: ${game.pot}
            </p>
          </div>
        ) : (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
            FREE
          </span>
        )}
      </div>

      {/* Claim section for winners with pot */}
      {game.isWinner && game.pot && game.pot > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          {/* Can claim - no status yet */}
          {canClaim && (
            <Button
              onClick={() => onClaimRetry(game.id)}
              size="sm"
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              disabled={isClaiming}
            >
              {isClaiming ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4 mr-2" />
              )}
              Claim ${netPrize.toFixed(2)}
            </Button>
          )}

          {/* Pending state */}
          {isClaimPending && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">
                  {game.claim_status === 'pending_confirmations' 
                    ? 'Awaiting confirmations...' 
                    : 'Processing...'}
                </span>
              </div>
              
              {showRetryForPending && (
                <Button
                  onClick={() => onClaimRetry(game.id)}
                  variant="outline"
                  size="sm"
                  className="w-full border-accent/50 text-accent hover:bg-accent/10"
                  disabled={isClaiming}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isClaiming && "animate-spin")} />
                  Retry Claim
                </Button>
              )}
            </div>
          )}

          {/* Confirmed state */}
          {isClaimConfirmed && (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs text-success font-medium">Claimed</span>
              {game.claim_tx_hash && (
                <a
                  href={`https://basescan.org/tx/${game.claim_tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-success/70 hover:text-success flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Failed state */}
          {isClaimFailed && !isClaimPending && (
            <Button
              onClick={() => onClaimRetry(game.id)}
              variant="outline"
              size="sm"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={isClaiming}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isClaiming && "animate-spin")} />
              Retry Claim
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MyGamesPage;
