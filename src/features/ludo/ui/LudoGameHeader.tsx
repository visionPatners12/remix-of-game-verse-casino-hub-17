/**
 * Ludo Game Header Component - Modern design with USDC/Base pot display
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Share, Eye } from 'lucide-react';
import { NetworkIndicator } from '../components/NetworkIndicator';
import { LudoPotBadge } from '../components/shared/LudoPotBadge';
import { motion } from 'framer-motion';

interface LudoGameHeaderProps {
  gameName?: string;
  roomCode?: string;
  isOnline: boolean;
  isSpectator: boolean;
  isLeaving: boolean;
  totalPot?: number;
  onExit: () => void;
  onBack: () => void;
  onShare: () => void;
}

export const LudoGameHeader: React.FC<LudoGameHeaderProps> = ({
  gameName,
  roomCode,
  isOnline,
  isSpectator,
  isLeaving,
  totalPot = 0,
  onExit,
  onBack,
  onShare,
}) => {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Spectator banner */}
      {isSpectator && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/60 backdrop-blur-sm text-muted-foreground text-center py-1.5 text-xs font-medium border-b border-white/5 flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Spectating</span>
        </motion.div>
      )}

      {/* Main header row */}
      <div className="flex items-center justify-between px-3 py-2.5 h-14">
        {/* Exit/Back button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {isSpectator ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1.5 h-8 px-2.5 rounded-xl hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Back</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              disabled={isLeaving}
              className="gap-1.5 h-8 px-2.5 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Exit</span>
            </Button>
          )}
        </motion.div>

        {/* Center: Game info */}
        <div className="flex items-center gap-2.5">
          {/* Room code + Network status */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
            <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
              {roomCode}
            </span>
            <NetworkIndicator isOnline={isOnline} />
          </div>
          
          {/* Pot badge - prominent display */}
          <LudoPotBadge 
            amount={totalPot} 
            size="sm" 
            variant="glow" 
            showTrophy={true}
          />
        </div>

        {/* Share button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="w-8 h-8 rounded-xl hover:bg-white/10 transition-all"
          >
            <Share className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default LudoGameHeader;
