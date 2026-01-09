
-- Create a function to get the round ID for a match
CREATE OR REPLACE FUNCTION public.get_match_round_id(p_match_id BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_round_id BIGINT;
BEGIN
  SELECT (data->>'round')->>'id' 
  INTO v_round_id
  FROM sport_matches
  WHERE id = p_match_id AND data->>'round' IS NOT NULL;
  
  RETURN v_round_id;
END;
$$;
