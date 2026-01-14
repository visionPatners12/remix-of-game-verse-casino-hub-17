/**
 * Waiting Room Header - Modern glassmorphism design with USDC/Base icons
 */

import React from 'react';
import { LogOut, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeaveGame } from '../../hooks/useLeaveGame';
import { useClipboard } from '@/hooks/useClipboard';

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

        {/* Center: Premium Room Code Display */}
        <motion.button
          onClick={handleCopyCode}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl 
            bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-orange-500/20 
            border border-amber-500/40 hover:border-amber-400/60
            shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]
            transition-all duration-300 group"
        >
          <span 
            className="font-mono text-lg tracking-[0.25em] font-black 
              bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 
              bg-clip-text text-transparent drop-shadow-sm"
          >
            {roomCode}
          </span>
          <Copy className="w-4 h-4 text-amber-400/70 group-hover:text-amber-300 transition-colors" />
        </motion.button>

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
