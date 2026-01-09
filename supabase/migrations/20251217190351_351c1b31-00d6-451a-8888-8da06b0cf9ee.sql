-- Drop the OLD version of rpc_user_feed with correct signature (uuid types)
DROP FUNCTION IF EXISTS public.rpc_user_feed(
  p_sport_id uuid,
  p_limit integer,
  p_cursor_ts timestamp with time zone,
  p_cursor_type text,
  p_cursor_id uuid,
  p_now timestamp with time zone,
  p_match_past interval,
  p_match_future interval,
  p_highlight_past interval
);