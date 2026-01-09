
-- Créer une fonction pour récupérer toutes les ligues avec leurs matchs
CREATE OR REPLACE FUNCTION get_all_leagues_with_matches()
RETURNS TABLE (
  id INTEGER,
  league_id INTEGER,
  league_name TEXT,
  league_image TEXT,
  starting_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  scores JSONB,
  match_data JSONB
)
LANGUAGE SQL
AS $$
  SELECT 
    sm.id,
    sl.id as league_id,
    sl.name as league_name,
    sl.image_path as league_image,
    sm.starting_at,
    sm.status,
    sm.scores,
    sm.data as match_data
  FROM sport_matches sm
  INNER JOIN sport_leagues sl ON sm.league_id = sl.id
  WHERE sm.is_active = true
  ORDER BY sl.id, sm.starting_at ASC;
$$;
