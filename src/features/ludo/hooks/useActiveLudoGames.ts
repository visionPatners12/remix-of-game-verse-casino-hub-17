import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LudoGameWithPlayers {
  id: string;
  game_name: string;
  status: string;
  current_players: number;
  max_players: number;
  room_code: string;
  turn: string;
  created_at: string;
  players: Array<{
    id: string;
    user_id: string;
    color: string;
    turn_order: number;
    is_ready: boolean;
    is_connected: boolean;
    users: {
      username: string;
      first_name: string;
      last_name: string;
      avatar_url: string;
    } | null;
  }>;
}

export const useActiveLudoGames = () => {
  const [games, setGames] = useState<LudoGameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch games with their players - use a different approach due to foreign key issues
      const { data: gamesData, error: gamesError } = await supabase
        .from('ludo_games')
        .select(`
          id,
          game_name,
          status,
          current_players,
          max_players,
          room_code,
          turn,
          created_at
        `)
        .in('status', ['created', 'active'])
        .order('created_at', { ascending: false });

      if (gamesError) {
        throw gamesError;
      }

      // Fetch players separately for each game
      const gamesWithPlayers = await Promise.all(
        (gamesData || []).map(async (game) => {
          const { data: players, error: playersError } = await supabase
            .from('ludo_game_players')
            .select(`
              id,
              user_id,
              color,
              turn_order,
              is_ready,
              is_connected,
              has_exited
            `)
            .eq('game_id', game.id)
            .eq('has_exited', false)
            .order('turn_order');

          if (playersError) {
            console.error('Error fetching players:', playersError);
            return { ...game, players: [] };
          }

          // Fetch user info for each player
          const playersWithUsers = await Promise.all(
            (players || []).map(async (player) => {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('username, first_name, last_name, avatar_url')
                .eq('id', player.user_id)
                .single();

              return {
                ...player,
                users: userError ? null : userData
              };
            })
          );

          return {
            ...game,
            players: playersWithUsers
          };
        })
      );

      setGames(gamesWithPlayers);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'Error loading games');
      toast({
        title: "Error",
        description: "Unable to load active games",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    // Set up real-time subscription for games updates
    const gamesChannel = supabase
      .channel('ludo-games-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ludo_games'
        },
        () => {
          fetchGames();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ludo_game_players'
        },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesChannel);
    };
  }, []);

  return {
    games,
    loading,
    error,
    refetch: fetchGames
  };
};