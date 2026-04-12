-- Align repo with production: refund queue table + pot RPC (idempotent on existing DBs)

-- 1) ludo_refund_queue (CREATE IF NOT EXISTS — safe if production already created it manually)
CREATE TABLE IF NOT EXISTS public.ludo_refund_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.ludo_games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  wallet_address text NOT NULL,
  status text NOT NULL,
  tx_hash text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ludo_refund_queue_game_id ON public.ludo_refund_queue(game_id);
CREATE INDEX IF NOT EXISTS idx_ludo_refund_queue_user_id ON public.ludo_refund_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_ludo_refund_queue_status ON public.ludo_refund_queue(status);

-- 2) ludo_increment_pot RPC (used by deposit / pot flows)
CREATE OR REPLACE FUNCTION public.ludo_increment_pot(
  p_game_id UUID,
  p_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ludo_games
  SET pot = COALESCE(pot, 0) + p_amount,
      updated_at = now()
  WHERE id = p_game_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game % not found', p_game_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ludo_increment_pot(UUID, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.ludo_increment_pot(UUID, NUMERIC) TO authenticated;
