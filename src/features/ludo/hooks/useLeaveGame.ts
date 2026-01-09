import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExitResponse {
  ok: boolean;
  action?: 'left' | 'exited';
  status?: 'created' | 'active';
  // For created (waiting room)
  gameDeleted?: boolean;
  remainingPlayers?: number;
  // For active games
  exit_position?: number;
  finished?: boolean;
  winner?: string | null;
  winner_user_id?: string | null;
  // Errors
  code?: string;
  error?: string;
}

export const useLeaveGame = () => {
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();

  const leaveGame = async (gameId: string, userId: string) => {
    if (isLeaving) return;
    
    setIsLeaving(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke<ExitResponse>('ludo-game', {
        body: { 
          action: 'exit', 
          gameId 
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      // Handle error responses
      if (!data?.ok) {
        const errorCode = data?.code;
        const errorMessage = data?.error || 'Failed to exit game';
        
        if (errorCode === 'FORBIDDEN') {
          toast.error('You are not in this game');
        } else if (errorCode === 'BAD_STATE') {
          toast.info('Game is not available');
        } else {
          throw new Error(errorMessage);
        }
        
        navigate('/games/ludo');
        return;
      }

      // Handle waiting room exit (status: created)
      if (data.status === 'created' && data.action === 'left') {
        if (data.gameDeleted) {
          toast.info('Game cancelled - no players remaining');
        } else {
          toast.success('You left the waiting room');
        }
        navigate('/games/ludo');
        return;
      }

      // Handle active game exit (status: active)
      if (data.status === 'active' && data.action === 'exited') {
        if (data.exit_position) {
          toast.success(`You left the game (Position: ${data.exit_position})`);
        } else {
          toast.success('You left the game');
        }
        
        if (data.finished && data.winner) {
          toast.info(`Game ended! Winner: ${data.winner}`);
        }
        navigate('/games/ludo');
        return;
      }

      // Fallback for unexpected response format
      toast.success('You left the game');
      navigate('/games/ludo');
      
    } catch (error) {
      console.error('Error leaving game:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to leave game');
    } finally {
      setIsLeaving(false);
    }
  };

  return { leaveGame, isLeaving };
};
