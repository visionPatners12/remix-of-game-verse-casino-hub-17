-- Streak bucket (last 5 finished games with a winner) + free-game matchmaking queue

CREATE OR REPLACE FUNCTION public.get_ludo_streak_bucket(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH recent AS (
    SELECT lg.winner_user_id
    FROM public.ludo_game_players lgp
    JOIN public.ludo_games lg ON lg.id = lgp.game_id AND lg.status = 'finished'
    WHERE lgp.user_id = p_user_id AND lg.winner_user_id IS NOT NULL
    ORDER BY lg.finished_at DESC NULLS LAST
    LIMIT 5
  ),
  scored AS (
    SELECT
      COALESCE(COUNT(*) FILTER (WHERE winner_user_id = p_user_id), 0)::int AS wins,
      COALESCE(COUNT(*) FILTER (WHERE winner_user_id IS NOT NULL AND winner_user_id <> p_user_id), 0)::int AS losses
    FROM recent
  )
  SELECT CASE
    WHEN (SELECT wins - losses FROM scored) >= 2 THEN 'hot'
    WHEN (SELECT wins - losses FROM scored) <= -2 THEN 'cold'
    ELSE 'mixed'
  END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ludo_streak_bucket(UUID) TO authenticated;

CREATE TABLE IF NOT EXISTS public.ludo_matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bet_amount NUMERIC(18, 6) NOT NULL DEFAULT 0,
  streak_bucket TEXT NOT NULL CHECK (streak_bucket IN ('hot', 'cold', 'mixed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ludo_matchmaking_queue_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_ludo_matchmaking_queue_lookup
  ON public.ludo_matchmaking_queue (bet_amount, streak_bucket, joined_at);

ALTER TABLE public.ludo_matchmaking_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own matchmaking row"
  ON public.ludo_matchmaking_queue
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.ludo_matchmaking_execute_match(picked UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game_id UUID;
  v_room TEXT;
BEGIN
  IF picked IS NULL OR COALESCE(array_length(picked, 1), 0) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_PICK');
  END IF;

  INSERT INTO public.ludo_games (
    created_by,
    status,
    bet_amount,
    max_players,
    is_public,
    pot,
    turn_started_at,
    dice,
    winner,
    winner_user_id,
    started_at,
    finished_at,
    claim_tx_hash,
    claim_status
  ) VALUES (
    picked[1],
    'created',
    0,
    4,
    true,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  )
  RETURNING id, room_code INTO v_game_id, v_room;

  INSERT INTO public.ludo_game_players (game_id, user_id, color, is_ready, deposit_status, is_connected, has_exited) VALUES
    (v_game_id, picked[1], 'R', true, 'free', true, false),
    (v_game_id, picked[2], 'G', true, 'free', true, false),
    (v_game_id, picked[3], 'Y', true, 'free', true, false),
    (v_game_id, picked[4], 'B', true, 'free', true, false);

  DELETE FROM public.ludo_matchmaking_queue WHERE user_id = ANY (picked);

  RETURN jsonb_build_object(
    'ok', true,
    'matched', true,
    'game_id', v_game_id,
    'room_code', v_room
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ludo_matchmaking_execute_match(UUID[]) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.ludo_matchmaking_enter(p_bet_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  v_bucket TEXT;
  picked UUID[];
  qsize INT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  IF p_bet_amount IS NULL OR p_bet_amount < 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'BAD_BET');
  END IF;

  IF p_bet_amount > 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'STAKED_NOT_SUPPORTED');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.ludo_game_players lgp
    JOIN public.ludo_games lg ON lg.id = lgp.game_id
    WHERE lgp.user_id = uid
      AND COALESCE(lgp.has_exited, false) = false
      AND lg.status IN ('created', 'active')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ACTIVE_GAME');
  END IF;

  v_bucket := public.get_ludo_streak_bucket(uid);

  DELETE FROM public.ludo_matchmaking_queue WHERE user_id = uid;
  INSERT INTO public.ludo_matchmaking_queue (user_id, bet_amount, streak_bucket)
  VALUES (uid, p_bet_amount, v_bucket);

  SELECT ARRAY_AGG(user_id ORDER BY joined_at) INTO picked
  FROM (
    SELECT user_id, joined_at
    FROM public.ludo_matchmaking_queue
    WHERE bet_amount = p_bet_amount AND streak_bucket = v_bucket
    ORDER BY joined_at
    LIMIT 4
    FOR UPDATE SKIP LOCKED
  ) sub;

  IF picked IS NULL OR COALESCE(array_length(picked, 1), 0) < 4 THEN
    SELECT COUNT(*)::INT INTO qsize
    FROM public.ludo_matchmaking_queue
    WHERE bet_amount = p_bet_amount AND streak_bucket = v_bucket;
    RETURN jsonb_build_object(
      'ok', true,
      'matched', false,
      'bucket', v_bucket,
      'queue_size', qsize
    );
  END IF;

  RETURN public.ludo_matchmaking_execute_match(picked);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ludo_matchmaking_enter(NUMERIC) TO authenticated;

CREATE OR REPLACE FUNCTION public.ludo_matchmaking_poll()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  v_bucket TEXT;
  v_bet NUMERIC;
  picked UUID[];
  qsize INT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  PERFORM 1
  FROM public.ludo_matchmaking_queue
  WHERE user_id = uid
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_IN_QUEUE');
  END IF;

  SELECT streak_bucket, bet_amount INTO v_bucket, v_bet
  FROM public.ludo_matchmaking_queue
  WHERE user_id = uid;

  SELECT ARRAY_AGG(user_id ORDER BY joined_at) INTO picked
  FROM (
    SELECT user_id, joined_at
    FROM public.ludo_matchmaking_queue
    WHERE bet_amount = v_bet AND streak_bucket = v_bucket
    ORDER BY joined_at
    LIMIT 4
    FOR UPDATE SKIP LOCKED
  ) sub;

  IF picked IS NULL OR COALESCE(array_length(picked, 1), 0) < 4 THEN
    SELECT COUNT(*)::INT INTO qsize
    FROM public.ludo_matchmaking_queue
    WHERE bet_amount = v_bet AND streak_bucket = v_bucket;
    RETURN jsonb_build_object(
      'ok', true,
      'matched', false,
      'bucket', v_bucket,
      'queue_size', qsize
    );
  END IF;

  RETURN public.ludo_matchmaking_execute_match(picked);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ludo_matchmaking_poll() TO authenticated;

CREATE OR REPLACE FUNCTION public.ludo_matchmaking_leave()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  DELETE FROM public.ludo_matchmaking_queue WHERE user_id = uid;
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ludo_matchmaking_leave() TO authenticated;
