-- Ludo: DB-side auto-start was unsafe vs edge `ludo-game` start (incomplete state: no turn/dice/rev).
-- Drops triggers; hardens all_players_ready for any future use; tightens ludo_games UPDATE to creator only
-- (edge uses service_role and bypasses RLS).

DROP TRIGGER IF EXISTS ludo_game_players_check_auto_start ON public.ludo_game_players;
DROP TRIGGER IF EXISTS ludo_game_players_check_auto_start_insert ON public.ludo_game_players;

CREATE OR REPLACE FUNCTION public.all_players_ready(game_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.ludo_game_players p
    WHERE p.game_id = all_players_ready.game_id
      AND COALESCE(p.has_exited, false) = false
      AND COALESCE(p.is_ready, false) IS DISTINCT FROM true
  )
  AND (
    SELECT COUNT(*)::int
    FROM public.ludo_game_players p
    WHERE p.game_id = all_players_ready.game_id
      AND COALESCE(p.has_exited, false) = false
  ) >= 2;
END;
$$;

DROP POLICY IF EXISTS "Players can update games during their turn" ON public.ludo_games;
DROP POLICY IF EXISTS "Game creators can update own ludo games" ON public.ludo_games;

CREATE POLICY "Game creators can update own ludo games"
ON public.ludo_games
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);
