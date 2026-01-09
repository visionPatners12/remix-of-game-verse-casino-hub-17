import React from 'react';
import { LogOut, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeaveGame } from '../../hooks/useLeaveGame';
import { useClipboard } from '@/hooks/useClipboard';

interface WaitingRoomHeaderProps {
  gameId: string;
  userId: string;
  roomCode: string;
  betAmount: number;
  onShare: () => void;
}

export const WaitingRoomHeader: React.FC<WaitingRoomHeaderProps> = ({
  gameId,
  userId,
  roomCode,
  betAmount,
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

  const isFreeGame = betAmount === 0;

  return (
    <header 
      className="sticky top-0 z-10 bg-background/95 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Leave button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLeave}
          disabled={isLeaving}
          className="gap-1.5 h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Leave</span>
        </Button>

        {/* Center: Room code + bet info */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          >
            <span className="font-mono tracking-wider">{roomCode}</span>
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="text-[10px] text-muted-foreground">
            {isFreeGame ? 'Free Game' : `${betAmount} USDT`}
          </span>
        </div>

        {/* Share button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onShare}
          className="w-8 h-8 rounded-full hover:bg-muted"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
