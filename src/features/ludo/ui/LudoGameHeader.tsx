/**
 * Ludo Game Header Component
 * Fixed header with exit, game info, network status, and share button
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Share, Eye } from 'lucide-react';
import { NetworkIndicator } from '../components/NetworkIndicator';

interface LudoGameHeaderProps {
  gameName?: string;
  roomCode?: string;
  isOnline: boolean;
  isSpectator: boolean;
  isLeaving: boolean;
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
  onExit,
  onBack,
  onShare,
}) => {
  return (
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
            onClick={onBack}
            className="gap-1.5 h-8 px-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">Back</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
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
            {gameName || 'Ludo'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono">
              {roomCode}
            </span>
            <NetworkIndicator isOnline={isOnline} />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onShare}
          className="w-8 h-8 rounded-full hover:bg-muted"
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default LudoGameHeader;
