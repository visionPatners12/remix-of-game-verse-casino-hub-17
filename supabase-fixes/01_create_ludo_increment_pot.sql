-- ============================================
-- LUDO FIX: Create missing ludo_increment_pot RPC
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the missing RPC function that check-ludo-deposits calls
CREATE OR REPLACE FUNCTION public.ludo_increment_pot(
  p_game_id UUID,
  p_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.ludo_increment_pot(UUID, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.ludo_increment_pot(UUID, NUMERIC) TO authenticated;

-- 2. Cleanup: Cancel stuck games with pending deposits and no tx_hash (older than 1 hour)
-- Optional: run this to clean up existing bad data
UPDATE public.ludo_game_players
SET deposit_status = 'cancelled', is_ready = false
WHERE deposit_status = 'pending'
  AND tx_hash IS NULL
  AND joined_at < now() - interval '1 hour';

-- 3. Verify the function was created
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'ludo_increment_pot' AND routine_schema = 'public';
