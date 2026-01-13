/**
 * Waiting Room Header - Modern glassmorphism design with USDC/Base icons
 */

import React from 'react';
import { LogOut, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeaveGame } from '../../hooks/useLeaveGame';
import { useClipboard } from '@/hooks/useClipboard';
import { LudoPotBadge } from '../shared/LudoPotBadge';
import { motion } from 'framer-motion';

interface WaitingRoomHeaderProps {
  gameId: string;
  userId: string;
  roomCode: string;
  betAmount: number;
  playerCount?: number;
  onShare: () => void;
}

export const WaitingRoomHeader: React.FC<WaitingRoomHeaderProps> = ({
  gameId,
  userId,
  roomCode,
  betAmount,
  playerCount = 4,
  onShare,
}) => {
  const { leaveGame, isLeaving } = useLeaveGame();
  const { copyToClipboard } = useClipboard();

  const handleLeave = () => {
    leaveGame(gameId, userId);
  };

  const handleCopyCode = () => {
    copyToClipboard(roomCode, `Code ${roomCode} copied!`);
  };

  const totalPot = betAmount * playerCount;

  return (
    <header 
      className="sticky top-0 z-10 bg-gradient-to-b from-background via-background/95 to-background/80 backdrop-blur-xl border-b border-white/5"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-3 h-16">
        {/* Leave button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            disabled={isLeaving}
            className="gap-1.5 h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">Leave</span>
          </Button>
        </motion.div>

        {/* Center: Room code + Pot */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Room code pill */}
          <motion.button
            onClick={handleCopyCode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-muted/60 hover:bg-muted/80 border border-border/30 rounded-lg px-3 py-1.5 transition-all group"
          >
            <span className="font-mono text-sm tracking-[0.2em] font-bold text-foreground">
              {roomCode}
            </span>
            <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>
          
          {/* Pot display */}
          <LudoPotBadge amount={totalPot} size="sm" showTrophy={false} />
        </div>

        {/* Share button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="w-9 h-9 rounded-xl hover:bg-primary/10 transition-all relative"
          >
            <Share2 className="w-4 h-4" />
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
};
