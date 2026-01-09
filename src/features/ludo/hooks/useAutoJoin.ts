import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useAutoJoin = (gameId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!user || !gameId) return;

    const checkAndJoinGame = async () => {
      setIsJoining(true);
      
      try {
        // Call backend join endpoint
        const { data, error: invokeError } = await supabase.functions.invoke('ludo-game', {
          body: { 
            action: 'join',
            gameId 
          }
        });

        if (invokeError) {
          console.error('Error joining game:', invokeError);
          toast({
            title: "Error",
            description: "Failed to join the game.",
            variant: "destructive",
          });
          return;
        }

        // Handle backend responses
        if (!data?.ok) {
          const errorCode = data?.code;
          const errorMessage = data?.error || 'Failed to join';
          
          if (errorCode === 'NOT_FOUND') {
            toast({
              title: "Game not found",
              description: "This game does not exist or has been deleted.",
              variant: "destructive",
            });
            navigate('/games/ludo/create');
          } else if (errorCode === 'BAD_STATE') {
            if (errorMessage.includes('full')) {
              toast({
                title: "Game full",
                description: "This game is already full.",
                variant: "destructive",
              });
            } else if (errorMessage.includes('started')) {
              toast({
                title: "Game already started",
                description: "This game has already started.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Cannot join",
                description: errorMessage,
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return;
        }

        // Handle successful responses
        if (data.action === 'already_joined') {
          // User was already in the game, just silently update connection status
          return;
        } else if (data.action === 'rejoined') {
          toast({
            title: "Rejoined game!",
            description: "Welcome back to the game.",
          });
        } else if (data.action === 'joined') {
          toast({
            title: "Joined game!",
            description: `You joined with color ${data.player.color}.`,
          });
        }

      } catch (error) {
        console.error('Auto-join error:', error);
      } finally {
        setIsJoining(false);
      }
    };

    checkAndJoinGame();
  }, [user, gameId, toast, navigate]);

  return { isJoining };
};
