import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type RpcPayload = Record<string, unknown> & {
  ok?: boolean;
  matched?: boolean;
  game_id?: string;
  room_code?: string;
  bucket?: string;
  queue_size?: number;
  code?: string;
};

const POLL_MS = 2000;
const MAX_MS = 5 * 60 * 1000;

async function fetchActiveCreatedGameId(userId: string): Promise<string | null> {
  const { data: rows } = await supabase
    .from('ludo_game_players')
    .select('game_id')
    .eq('user_id', userId)
    .eq('has_exited', false);

  const ids = (rows ?? []).map((r) => r.game_id).filter(Boolean) as string[];
  if (ids.length === 0) return null;

  const { data: game } = await supabase
    .from('ludo_games')
    .select('id')
    .in('id', ids)
    .eq('status', 'created')
    .limit(1)
    .maybeSingle();

  return game?.id ?? null;
}

export function useLudoMatchmaking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [bucketLabel, setBucketLabel] = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goToGame = useCallback(
    (gameId: string) => {
      clearTimer();
      setSearching(false);
      setQueueSize(null);
      navigate(`/games/ludo/play/${gameId}`);
    },
    [clearTimer, navigate],
  );

  const handlePayload = useCallback(
    async (data: RpcPayload | null): Promise<boolean> => {
      if (!data?.ok) {
        const code = data?.code;
        if (code === 'NOT_IN_QUEUE' && user?.id) {
          const gid = await fetchActiveCreatedGameId(user.id);
          if (gid) {
            goToGame(gid);
            return true;
          }
          clearTimer();
          setSearching(false);
          setQueueSize(null);
          return false;
        }
        return false;
      }
      if (data.matched && data.game_id) {
        goToGame(data.game_id);
        return true;
      }
      if (data.bucket) setBucketLabel(String(data.bucket));
      if (typeof data.queue_size === 'number') setQueueSize(data.queue_size);
      return false;
    },
    [goToGame, user?.id, clearTimer],
  );

  const stop = useCallback(async () => {
    clearTimer();
    setSearching(false);
    setQueueSize(null);
    await supabase.rpc('ludo_matchmaking_leave' as never);
  }, [clearTimer]);

  const pollOnce = useCallback(async () => {
    if (Date.now() > deadlineRef.current) {
      await stop();
      return;
    }
    const { data, error } = await supabase.rpc('ludo_matchmaking_poll' as never);
    if (error) return;
    const done = await handlePayload(data as RpcPayload);
    if (done) return;
  }, [handlePayload, stop]);

  const start = useCallback(async (): Promise<{ error?: string }> => {
    if (!user?.id) return { error: 'NO_USER' };
    clearTimer();
    setSearching(true);
    setBucketLabel(null);
    deadlineRef.current = Date.now() + MAX_MS;

    const { data, error } = await supabase.rpc('ludo_matchmaking_enter' as never, {
      p_bet_amount: 0,
    });
    if (error) {
      setSearching(false);
      return { error: error.message };
    }
    const payload = data as RpcPayload;
    if (payload && payload.ok === false && payload.code) {
      setSearching(false);
      return { error: String(payload.code) };
    }
    const done = await handlePayload(payload);
    if (done) return {};

    void pollOnce();
    timerRef.current = setInterval(() => {
      void pollOnce();
    }, POLL_MS);
    return {};
  }, [user?.id, clearTimer, handlePayload, pollOnce]);

  useEffect(() => {
    return () => {
      clearTimer();
      void supabase.rpc('ludo_matchmaking_leave' as never);
    };
  }, [clearTimer]);

  return {
    searching,
    bucketLabel,
    queueSize,
    start,
    stop,
  };
}
