import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useJoinGameByCode = () => {
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const joinGame = async (roomCode: string) => {
    if (!roomCode || roomCode.length !== 6) {
      toast.error("Code must be 6 characters");
      return false;
    }

    setIsJoining(true);
    try {
      // Find game by room code
      const { data: gameData, error } = await supabase
        .from('ludo_games')
        .select('id, status, current_players, max_players')
        .eq('room_code', roomCode.toUpperCase())
        .maybeSingle();

      if (error || !gameData) {
        toast.error("No game found with this code");
        return false;
      }

      // Redirect to the game
      navigate(`/games/ludo/play/${gameData.id}`);
      toast.success("Game found! Redirecting...");
      return true;
      
    } catch (error) {
      console.error('Error finding game:', error);
      toast.error("Unable to join the game");
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return { joinGame, isJoining };
};
