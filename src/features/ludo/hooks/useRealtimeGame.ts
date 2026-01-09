import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import type { GameData, PlayerData, Positions } from '../types';

export const useRealtimeGame = (gameId: string): {
  gameData: GameData | null;
  players: PlayerData[];
  currentPlayer: PlayerData | undefined;
  loading: boolean;
  toggleReady: () => Promise<void>;
  isOnline: boolean;
} => {
  const { user } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();

  // Load initial data function (extracted for reuse)
  const loadInitialData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      // Load game data
      const { data: game, error: gameError } = await supabase
        .from('ludo_games')
        .select('id, game_name, room_code, status, current_players, max_players, turn, dice, extra_turn_on_six, created_by, created_at, started_at, positions, bet_amount, winner, winner_user_id, pot, claim_status, claim_tx_hash, turn_started_at')
        .eq('id', gameId)
        .maybeSingle();

      if (gameError) {
        logger.error('Error loading game:', gameError);
        return;
      }

      setGameData(game ? { ...game, positions: game.positions as Positions } as GameData : null);

      // Load players data (excluding exited players)
      const { data: playersData, error: playersError } = await supabase
        .from('ludo_game_players')
        .select('id, user_id, color, position, is_ready, is_connected, turn_order, last_seen_at, has_exited, deposit_status, tx_hash')
        .eq('game_id', gameId)
        .eq('has_exited', false)
        .order('turn_order', { ascending: true });

      if (playersError) {
        logger.error('Error loading players:', playersError);
        return;
      }

      // Cast to include optional tx fields that may come from realtime updates
      setPlayers((playersData || []) as PlayerData[]);

    } catch (error) {
      logger.error('Error loading initial data:', error);
    }
  }, [gameId]);

  // Initial data load
  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    loadInitialData().finally(() => setLoading(false));
  }, [gameId, loadInitialData]);

  // Reconnection handler - refetch data when network comes back
  useEffect(() => {
    if (isOnline && wasOffline && gameId) {
      logger.debug('🔄 Network restored, refetching game data...');
      loadInitialData();
      toast.success('Reconnected', { duration: 2000 });
      resetWasOffline();
    }
  }, [isOnline, wasOffline, gameId, loadInitialData, resetWasOffline]);

  // Real-time subscriptions
  useEffect(() => {
    if (!gameId) return;

    // Subscribe to game changes
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ludo_games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGameData(prev => prev ? { 
            ...prev, 
            ...payload.new, 
            positions: payload.new.positions as Positions 
          } as GameData : null);
        }
      )
      .subscribe();

    // Subscribe to players changes
    const playersChannel = supabase
      .channel(`players-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ludo_game_players',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new as PlayerData]);
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => prev.map(player => 
              player.id === payload.new.id ? { ...player, ...payload.new } : player
            ));
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(player => player.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [gameId]);

  // Heartbeat for connection tracking
  useEffect(() => {
    if (!user || !gameId) return;

    const updateHeartbeat = async () => {
      const { data: player } = await supabase
        .from('ludo_game_players')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (player) {
        await supabase
          .from('ludo_game_players')
          .update({
            last_seen_at: new Date().toISOString(),
            is_connected: true,
          })
          .eq('id', player.id);
      }
    };

    // Update immediately
    updateHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(updateHeartbeat, 30000);

    // Mark as disconnected when leaving
    const handleBeforeUnload = async () => {
      const { data: player } = await supabase
        .from('ludo_game_players')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (player) {
        await supabase
          .from('ludo_game_players')
          .update({ is_connected: false })
          .eq('id', player.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, gameId]);

  const currentPlayer = players.find(p => p.user_id === user?.id);

  const toggleReady = async () => {
    if (!currentPlayer) return;

    await supabase
      .from('ludo_game_players')
      .update({ is_ready: !currentPlayer.is_ready })
      .eq('id', currentPlayer.id);
  };

  return {
    gameData,
    players,
    currentPlayer,
    loading,
    toggleReady,
    isOnline,
  };
};