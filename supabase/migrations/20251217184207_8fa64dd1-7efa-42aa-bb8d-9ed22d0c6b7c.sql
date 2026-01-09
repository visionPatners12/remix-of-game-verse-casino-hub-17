-- Drop the OLD version of rpc_user_feed that uses p_cursor_ts parameter
-- This ensures only the new version with p_cursor_sort_ts is used
DROP FUNCTION IF EXISTS public.rpc_user_feed(
  p_limit integer,
  p_sport_id text,
  p_cursor_ts timestamp with time zone,
  p_cursor_type text,
  p_cursor_id uuid,
  p_now timestamp with time zone,
  p_highlight_past interval,
  p_match_future interval,
  p_match_past interval
);