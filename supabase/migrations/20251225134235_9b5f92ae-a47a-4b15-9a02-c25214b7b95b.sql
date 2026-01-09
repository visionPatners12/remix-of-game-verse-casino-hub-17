-- Function to count followers for any entity type
-- Uses SECURITY DEFINER to bypass RLS and return accurate counts
CREATE OR REPLACE FUNCTION public.get_entity_followers_count(
  p_entity_type text,
  p_entity_id text
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_uuid uuid;
BEGIN
  -- Convert text to uuid safely
  BEGIN
    v_uuid := p_entity_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN 0;
  END;

  IF p_entity_type = 'league' THEN
    SELECT COUNT(*)::integer INTO v_count 
    FROM user_preferences 
    WHERE entity_type = 'league' AND league_id = v_uuid;
  ELSIF p_entity_type = 'team' THEN
    SELECT COUNT(*)::integer INTO v_count 
    FROM user_preferences 
    WHERE entity_type = 'team' AND team_id = v_uuid;
  ELSIF p_entity_type = 'player' THEN
    SELECT COUNT(*)::integer INTO v_count 
    FROM user_preferences 
    WHERE entity_type = 'player' AND player_id = v_uuid;
  ELSE
    v_count := 0;
  END IF;
  
  RETURN COALESCE(v_count, 0);
END;
$$;