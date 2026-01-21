import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Clock, Minus, Wallet, RefreshCw, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { PastGame, ClaimStatus } from '../hooks/useUserPastGames';

interface LudoHistoryAccordionProps {
  games: PastGame[];
  loading: boolean;
  userId?: string;
  onClaimRetry?: (gameId: string) => void;
  isClaimingGame?: string | null;
}

export const LudoHistoryAccordion: React.FC<LudoHistoryAccordionProps> = ({ 
  games, 
  loading,
  userId,
  onClaimRetry,
  isClaimingGame
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="py-4">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3 group">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            My History
          </h2>
          <span className="text-xs text-muted-foreground/60">
            ({games.length})
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pb-4"
            >
              {games.map((game, index) => (
                <HistoryCard 
                  key={game.id} 
                  game={game} 
                  index={index}
                  isWinner={game.winner_user_id === userId}
                  onClaimRetry={onClaimRetry}
                  isClaimingGame={isClaimingGame}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface HistoryCardProps {
  game: PastGame;
  index: number;
  isWinner: boolean;
  onClaimRetry?: (gameId: string) => void;
  isClaimingGame?: string | null;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ 
  game, 
  index, 
  isWinner, 
  onClaimRetry,
  isClaimingGame 
}) => {
  const [showRetryForPending, setShowRetryForPending] = useState(false);
  
  const timeAgo = game.finished_at 
    ? formatDistanceToNow(new Date(game.finished_at), { addSuffix: true })
    : 'Unknown';

  const claimStatus = game.claim_status;
  const isPending = isClaimingGame === game.id;
  const hasPot = game.pot && game.pot > 0;
  const netPrize = hasPot ? game.pot * 0.9 : 0;

  // Claim states
  const isClaimPending = claimStatus === 'received' || claimStatus === 'pending_confirmations';
  const isClaimConfirmed = claimStatus === 'confirmed';
  const isClaimFailed = claimStatus === 'mismatch' || claimStatus === 'reverted' || claimStatus === 'timeout';
  const canClaim = isWinner && hasPot && !claimStatus && !isPending;

  // 30s timer for stuck pending claims
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isClaimPending && !isPending) {
      timer = setTimeout(() => {
        setShowRetryForPending(true);
      }, 30000);
    } else {
      setShowRetryForPending(false);
    }
    
    return () => clearTimeout(timer);
  }, [claimStatus, isPending, isClaimPending]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isWinner 
          ? 'bg-success/5 border-success/20' 
          : 'bg-muted/30 border-border'
      }`}
    >
      {/* Result icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isWinner 
          ? 'bg-success/20 text-success' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {isWinner ? (
          <Trophy className="w-4 h-4" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </div>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">
            #{game.room_code || 'N/A'}
          </span>
          {isWinner && (
            <span className="text-[10px] font-semibold text-success uppercase">
              Won
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Prize/bet info + Claim status */}
      <div className="flex items-center gap-2">
        {hasPot ? (
          <span className={`text-sm font-semibold ${
            isWinner ? 'text-success' : 'text-muted-foreground'
          }`}>
            {isWinner ? '+' : ''}${netPrize.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">FREE</span>
        )}

        {/* Claim button for unclaimed wins */}
        {canClaim && onClaimRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onClaimRetry(game.id)}
            className="h-7 px-2 text-xs border-success/50 text-success hover:bg-success/10"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Claim
          </Button>
        )}

        {/* Pending state with retry after 30s */}
        {isClaimPending && !isPending && (
          showRetryForPending && onClaimRetry ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onClaimRetry(game.id)}
              className="h-7 px-2 text-xs border-warning/50 text-warning hover:bg-warning/10"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          ) : (
            <span className="text-xs text-warning flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </span>
          )
        )}

        {/* Loading state */}
        {isPending && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
          </span>
        )}

        {/* Confirmed state */}
        {isClaimConfirmed && (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-success" />
            {game.claim_tx_hash && (
              <a
                href={`https://basescan.org/tx/${game.claim_tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Failed state */}
        {isClaimFailed && onClaimRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onClaimRetry(game.id)}
            className="h-7 px-2 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </motion.div>
  );
};
