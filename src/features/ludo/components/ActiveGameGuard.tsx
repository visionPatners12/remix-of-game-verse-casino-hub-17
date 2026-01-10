import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserActiveGame } from '../hooks/useUserActiveGame';

interface ActiveGameGuardProps {
  children: React.ReactNode;
  allowedGameId?: string;
}

const LoadingSpinner = ({ message }: { message?: string }) => (
  <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    {message && <p className="text-muted-foreground text-sm">{message}</p>}
  </div>
);

export const ActiveGameGuard = ({ children, allowedGameId }: ActiveGameGuardProps) => {
  const { user } = useAuth();
  const { activeGame, loading } = useUserActiveGame(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    // If user has an active game and it's not the allowed game, redirect
    if (!loading && activeGame && activeGame.id !== allowedGameId) {
      toast.info("Redirecting to your active game...");
      navigate(`/games/ludo/play/${activeGame.id}`, { replace: true });
    }
  }, [activeGame, loading, allowedGameId, navigate]);

  // Show loading while checking
  if (loading) {
    return <LoadingSpinner />;
  }

  // If redirect is needed, show loading with message
  if (activeGame && activeGame.id !== allowedGameId) {
    return <LoadingSpinner message="Redirecting to your game..." />;
  }

  return <>{children}</>;
};

// Wrapper component for LudoKonva that gets gameId from params
export const LudoKonvaWithGuard = ({ children }: { children: React.ReactNode }) => {
  const { gameId } = useParams<{ gameId: string }>();
  
  return (
    <ActiveGameGuard allowedGameId={gameId}>
      {children}
    </ActiveGameGuard>
  );
};
