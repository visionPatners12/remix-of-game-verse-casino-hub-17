import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Gamepad2, LogOut } from 'lucide-react';
import { useLeaveGame } from '../hooks/useLeaveGame';
import { useAuth } from '@/hooks/useAuth';

interface ActiveGameBannerProps {
  gameId: string;
  gameName: string | null;
  status: string;
}

export const ActiveGameBanner = ({ gameId, gameName, status }: ActiveGameBannerProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveGame, isLeaving } = useLeaveGame();

  const handleResume = () => {
    navigate(`/games/ludo/play/${gameId}`);
  };

  const handleLeave = () => {
    if (user?.id) {
      leaveGame(gameId, user.id);
    }
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {gameName || 'Ludo Game'}
            </p>
            <p className="text-sm text-muted-foreground">
              {status === 'active' ? 'Game in progress' : 'Waiting for players'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleLeave} 
            size="sm" 
            variant="ghost"
            disabled={isLeaving}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </Button>
          <Button onClick={handleResume} size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
};
