import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserActiveGame } from './useUserActiveGame';

/**
 * Global hook that redirects users to their active Ludo game on page load.
 * Should be called once at the app root level (AuthInitializer).
 */
export const useGlobalActiveGameRedirect = () => {
  const { user } = useAuth();
  const { activeGame, loading } = useUserActiveGame(user?.id);
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Avoid multiple redirections in the same session
    if (hasRedirected.current) return;
    
    // Don't redirect if already on a game play page
    if (location.pathname.startsWith('/games/ludo/play/')) return;
    
    // Excluded paths - don't interrupt these flows
    const excludedPaths = ['/auth', '/onboarding', '/games/ludo'];
    const isExcluded = excludedPaths.some(p => 
      location.pathname === p || location.pathname.startsWith(p + '/')
    );
    
    // Allow the games list page itself
    if (location.pathname === '/games/ludo') return;
    
    if (isExcluded) return;
    
    // Redirect to active game if found
    if (!loading && activeGame) {
      hasRedirected.current = true;
      toast.info('Redirecting to your active game...');
      navigate(`/games/ludo/play/${activeGame.id}`, { replace: true });
    }
  }, [activeGame, loading, location.pathname, navigate]);
};
