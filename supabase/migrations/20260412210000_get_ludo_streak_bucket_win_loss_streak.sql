-- Matchmaking buckets: "hot" = won every recent game in window, "cold" = lost every one, "mixed" = otherwise.
-- Uses up to 5 most recent finished Ludo games with a declared winner.

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
  stats AS (
    SELECT
      COUNT(*)::int AS n,
      COUNT(*) FILTER (WHERE winner_user_id = p_user_id)::int AS wins,
      COUNT(*) FILTER (WHERE winner_user_id IS NOT NULL AND winner_user_id <> p_user_id)::int AS losses
    FROM recent
  )
  SELECT CASE
    WHEN (SELECT n FROM stats) = 0 THEN 'mixed'
    WHEN (SELECT wins FROM stats) = (SELECT n FROM stats) THEN 'hot'
    WHEN (SELECT losses FROM stats) = (SELECT n FROM stats) THEN 'cold'
    ELSE 'mixed'
  END;
$$;
