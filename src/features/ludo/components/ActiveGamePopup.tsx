import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Gamepad2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserActiveGame } from '../hooks/useUserActiveGame';

export const ActiveGamePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastShownGameId, setLastShownGameId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { activeGame, loading } = useUserActiveGame(user?.id);

  // Check if already on the game page
  const isOnGamePage = location.pathname.startsWith('/games/ludo/play/');

  const checkAndShowPopup = useCallback(() => {
    if (
      activeGame &&
      !isOnGamePage &&
      activeGame.id !== lastShownGameId
    ) {
      setIsOpen(true);
      setLastShownGameId(activeGame.id);
    }
  }, [activeGame, isOnGamePage, lastShownGameId]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // Small delay to let data refresh
      setTimeout(checkAndShowPopup, 500);
    }
  }, [checkAndShowPopup]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const handleResume = () => {
    setIsOpen(false);
    if (activeGame) {
      navigate(`/games/ludo/play/${activeGame.id}`);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  // Don't render if no user, loading, no active game, or on game page
  if (!user || loading || !activeGame || isOnGamePage) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-sm rounded-xl">
        <AlertDialogHeader className="items-center text-center">
          <div className="p-3 bg-primary/20 rounded-full mb-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <AlertDialogTitle>Game in Progress</AlertDialogTitle>
          <AlertDialogDescription>
            You have an active Ludo game: <strong>{activeGame.game_name || 'Ludo Game'}</strong>
            {activeGame.status === 'active' 
              ? '. The game is waiting for your turn!'
              : '. Players are waiting for you.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleDismiss} className="w-full sm:w-auto">
            Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleResume} className="w-full sm:w-auto">
            Resume Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
