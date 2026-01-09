import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { Share, Copy, Users } from 'lucide-react';

interface ShareGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  roomCode: string;
  currentPlayers: number;
  maxPlayers: number;
}

export const ShareGameModal: React.FC<ShareGameModalProps> = ({
  isOpen,
  onClose,
  gameId,
  roomCode,
  currentPlayers,
  maxPlayers,
}) => {
  const { copyToClipboard } = useClipboard();

  const gameUrl = `${window.location.origin}/games/ludo/play/${gameId}`;
  const joinUrl = `${window.location.origin}/games/ludo/join/${roomCode}`;

  const handleCopyLink = () => {
    copyToClipboard(gameUrl, "Game link copied!");
  };

  const handleCopyRoomCode = () => {
    copyToClipboard(roomCode, "Room code copied!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Ludo game',
          text: `Join my Ludo game with code: ${roomCode}`,
          url: gameUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Invite Players
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">{roomCode}</div>
            <div className="text-sm text-muted-foreground">
              {currentPlayers}/{maxPlayers} players connected
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleShare}
              className="w-full"
              size="lg"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Game
            </Button>

            <Button 
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            <div className="flex gap-2">
              <Button 
                onClick={handleCopyRoomCode}
                variant="secondary"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Code: {roomCode}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Players can join with the link or room code
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
