/**
 * Ludo Game HUD - Premium Gaming UI
 * Minimal top bar + floating controls overlay
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Share, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LeaveGameDialog } from '../components/LeaveGameDialog';

interface LudoGameHUDProps {
  // Header props
  roomCode?: string;
  isOnline: boolean;
  isSpectator: boolean;
  isLeaving: boolean;
  betAmount: number;
  onExit: () => void;
  onBack: () => void;
  onShare: () => void;
  children?: React.ReactNode; // For floating controls
}

export const LudoGameHUD: React.FC<LudoGameHUDProps> = ({
  roomCode,
  isOnline,
  isSpectator,
  isLeaving,
  betAmount,
  onExit,
  onBack,
  onShare,
  children,
}) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleExitClick = () => {
    if (isSpectator) {
      onBack();
    } else {
      setShowLeaveDialog(true);
    }
  };

  const handleConfirmLeave = () => {
    onExit();
    setShowLeaveDialog(false);
  };

  return (
    <>
      {/* Ultra-minimal Top Bar */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Gradient overlay for visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
        
        {/* Spectator banner - ultra compact */}
        <AnimatePresence>
          {isSpectator && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative bg-muted/40 backdrop-blur-sm text-muted-foreground text-center py-1 text-[10px] font-medium flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>Spectating</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main bar - 48px height */}
        <div className="relative flex items-center justify-between h-12 px-3">
          {/* Exit/Back - icon only with subtle bg */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExitClick}
              disabled={isLeaving}
              className={cn(
                "w-9 h-9 rounded-full border",
                isSpectator
                  ? "bg-white/5 hover:bg-white/10 border-white/10"
                  : "bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive"
              )}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Center: Room code pill + Network status */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                {roomCode}
              </span>
              <div className="w-px h-3 bg-white/20" />
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isOnline 
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" 
                  : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"
              )} />
            </div>
          </motion.div>

          {/* Share - icon only */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Share className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Floating Controls Container - children go here */}
      {children}

      {/* Leave Confirmation Dialog - only for non-spectators */}
      {!isSpectator && (
        <LeaveGameDialog
          open={showLeaveDialog}
          onOpenChange={setShowLeaveDialog}
          gameStatus="active"
          betAmount={betAmount}
          isLeaving={isLeaving}
          onConfirm={handleConfirmLeave}
        />
      )}
    </>
  );
};

export default LudoGameHUD;
