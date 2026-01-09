import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PastGamePlayer {
  id: string;
  user_id: string;
  color: string;
  turn_order: number;
  users: {
    username: string | null;
    first_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface PastGame {
  id: string;
  game_name: string | null;
  room_code: string | null;
  bet_amount: number | null;
  pot: number | null;
  winner: string | null;
  winner_user_id: string | null;
  finished_at: string | null;
  max_players: number;
  userColor: string | null;
  isWinner: boolean;
  players: PastGamePlayer[];
  winnerUser: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const useUserPastGames = (userId: string | undefined) => {
  const [games, setGames] = useState<PastGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPastGames = async () => {
    if (!userId) {
      setGames([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, get all game_ids where user participated
      const { data: playerGames, error: playerError } = await supabase
        .from('ludo_game_players')
        .select('game_id, color')
        .eq('user_id', userId);

      if (playerError) throw playerError;

      if (!playerGames || playerGames.length === 0) {
        setGames([]);
        setLoading(false);
        return;
      }

      const gameIds = playerGames.map(p => p.game_id).filter(Boolean) as string[];
      const userColorMap = new Map(playerGames.map(p => [p.game_id, p.color]));

      // Fetch finished games
      const { data: finishedGames, error: gamesError } = await supabase
        .from('ludo_games')
        .select(`
          id,
          game_name,
          room_code,
          bet_amount,
          pot,
          winner,
          winner_user_id,
          finished_at,
          max_players
        `)
        .in('id', gameIds)
        .eq('status', 'finished')
        .order('finished_at', { ascending: false })
        .limit(20);

      if (gamesError) throw gamesError;

      if (!finishedGames || finishedGames.length === 0) {
        setGames([]);
        setLoading(false);
        return;
      }

      // Fetch players and winner info for each game
      const gamesWithDetails = await Promise.all(
        finishedGames.map(async (game) => {
          // Fetch all players
          const { data: players } = await supabase
            .from('ludo_game_players')
            .select('id, user_id, color, turn_order')
            .eq('game_id', game.id)
            .order('turn_order');

          // Fetch user info for players
          const playersWithUsers = await Promise.all(
            (players || []).map(async (player) => {
              const { data: userData } = await supabase
                .from('users')
                .select('username, first_name, avatar_url')
                .eq('id', player.user_id)
                .single();
              return { ...player, users: userData };
            })
          );

          // Fetch winner user info
          let winnerUser = null;
          if (game.winner_user_id) {
            const { data: winnerData } = await supabase
              .from('users')
              .select('username, avatar_url')
              .eq('id', game.winner_user_id)
              .single();
            winnerUser = winnerData;
          }

          return {
            ...game,
            userColor: userColorMap.get(game.id) || null,
            isWinner: game.winner_user_id === userId,
            players: playersWithUsers,
            winnerUser
          };
        })
      );

      setGames(gamesWithDetails);
    } catch (err) {
      console.error('Error fetching past games:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastGames();
  }, [userId]);

  return { games, loading, error, refetch: fetchPastGames };
};
