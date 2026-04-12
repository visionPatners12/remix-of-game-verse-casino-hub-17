import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [realtimeGeneration, setRealtimeGeneration] = useState(0);
  const resubscribeLockRef = useRef(false);
  const playerRowIdRef = useRef<string | null>(null);

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
      const list = (playersData || []) as PlayerData[];
      setPlayers(list);

      if (user?.id) {
        const mine = list.find((p) => p.user_id === user.id);
        playerRowIdRef.current = mine?.id ?? null;
      } else {
        playerRowIdRef.current = null;
      }

    } catch (error) {
      logger.error('Error loading initial data:', error);
    }
  }, [gameId, user?.id]);

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

  // Real-time subscriptions (re-subscribe after channel error / timeout)
  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;
    const topicSuffix = `${gameId}-${realtimeGeneration}`;

    const scheduleResubscribe = (reason: string, err: unknown) => {
      if (cancelled || resubscribeLockRef.current) return;
      resubscribeLockRef.current = true;
      logger.warn(`Realtime ${reason}, resubscribing…`, err);
      setTimeout(() => {
        if (cancelled) return;
        resubscribeLockRef.current = false;
        void loadInitialData();
        setRealtimeGeneration((g) => g + 1);
      }, 2000);
    };

    const gameChannel = supabase
      .channel(`ludo-rt-game-${topicSuffix}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ludo_games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGameData((prev) =>
            prev
              ? ({
                  ...prev,
                  ...payload.new,
                  positions: payload.new.positions as Positions,
                } as GameData)
              : null
          );
        }
      );

    const playersChannel = supabase
      .channel(`ludo-rt-players-${topicSuffix}`)
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
            const newPlayer = payload.new as PlayerData;
            if (!newPlayer.has_exited) {
              setPlayers((prev) => {
                const exists = prev.some((p) => p.id === newPlayer.id);
                if (exists) return prev;
                return [...prev, newPlayer];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlayer = payload.new as PlayerData;
            if (updatedPlayer.has_exited) {
              setPlayers((prev) => prev.filter((p) => p.id !== updatedPlayer.id));
            } else {
              setPlayers((prev) =>
                prev.map((player) =>
                  player.id === updatedPlayer.id ? { ...player, ...updatedPlayer } : player
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) => prev.filter((player) => player.id !== payload.old.id));
          }
        }
      );

    gameChannel.subscribe((status, err) => {
      if (cancelled) return;
      if (status === 'SUBSCRIBED') {
        logger.debug('✅ Game channel subscribed');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        supabase.removeChannel(gameChannel);
        supabase.removeChannel(playersChannel);
        scheduleResubscribe(`game channel ${status}`, err);
      }
    });

    playersChannel.subscribe((status, err) => {
      if (cancelled) return;
      if (status === 'SUBSCRIBED') {
        logger.debug('✅ Players channel subscribed');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        supabase.removeChannel(gameChannel);
        supabase.removeChannel(playersChannel);
        scheduleResubscribe(`players channel ${status}`, err);
      }
    });

    return () => {
      cancelled = true;
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [gameId, realtimeGeneration, loadInitialData]);

  // Visibility / page lifecycle: refetch when visible; mark disconnected on hide, pagehide, and unmount
  useEffect(() => {
    if (!gameId || !user) return;

    const markDisconnected = () => {
      const rowId = playerRowIdRef.current;
      if (!rowId) return;
      void supabase
        .from('ludo_game_players')
        .update({ is_connected: false })
        .eq('id', rowId);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logger.debug('🔄 Tab visible, refetching game data...');
        void loadInitialData();
        return;
      }
      if (document.visibilityState === 'hidden') {
        markDisconnected();
      }
    };

    const handlePageHide = () => {
      markDisconnected();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      markDisconnected();
    };
  }, [gameId, user, loadInitialData]);

  // Heartbeat for connection tracking
  useEffect(() => {
    if (!user || !gameId) return;

    const updateHeartbeat = async () => {
      try {
        const { data: player, error: fetchError } = await supabase
          .from('ludo_game_players')
          .select('id')
          .eq('game_id', gameId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          logger.warn('⚠️ Heartbeat fetch error:', fetchError.message);
          return;
        }

        if (player) {
          playerRowIdRef.current = player.id;
          const { error: updateError } = await supabase
            .from('ludo_game_players')
            .update({
              last_seen_at: new Date().toISOString(),
              is_connected: true,
            })
            .eq('id', player.id);
          
          if (updateError) {
            logger.warn('⚠️ Heartbeat update error:', updateError.message);
          }
        } else {
          playerRowIdRef.current = null;
        }
      } catch (error) {
        logger.warn('⚠️ Heartbeat exception:', error);
      }
    };

    // Update immediately
    updateHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(updateHeartbeat, 30000);

    return () => {
      clearInterval(interval);
      const rowId = playerRowIdRef.current;
      if (rowId) {
        void supabase
          .from('ludo_game_players')
          .update({ is_connected: false })
          .eq('id', rowId);
      }
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