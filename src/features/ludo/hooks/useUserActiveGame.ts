import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveGame {
  id: string;
  game_name: string | null;
  status: string;
  bet_amount: number | null;
  room_code: string | null;
}

export const useUserActiveGame = (userId: string | undefined) => {
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActiveGame = async () => {
      try {
        // Find games where user is a player and hasn't exited
        const { data: playerGames, error: playerError } = await supabase
          .from('ludo_game_players')
          .select('game_id')
          .eq('user_id', userId)
          .eq('has_exited', false);

        if (playerError) throw playerError;

        if (!playerGames || playerGames.length === 0) {
          setActiveGame(null);
          setLoading(false);
          return;
        }

        const gameIds = playerGames.map(pg => pg.game_id).filter(Boolean);

        // Find active games from those
        const { data: games, error: gamesError } = await supabase
          .from('ludo_games')
          .select('id, game_name, status, bet_amount, room_code')
          .in('id', gameIds)
          .in('status', ['created', 'active'])
          .limit(1)
          .maybeSingle();

        if (gamesError && gamesError.code !== 'PGRST116') {
          throw gamesError;
        }

        setActiveGame(games || null);
      } catch (error) {
        console.error('Error fetching active game:', error);
        setActiveGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveGame();

    // Subscribe to changes
    const channel = supabase
      .channel('user-active-game')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ludo_game_players', filter: `user_id=eq.${userId}` },
        () => fetchActiveGame()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ludo_games' },
        () => fetchActiveGame()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { activeGame, loading };
};
