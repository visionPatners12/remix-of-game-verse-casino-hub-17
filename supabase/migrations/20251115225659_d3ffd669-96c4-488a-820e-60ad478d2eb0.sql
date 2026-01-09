-- Drop et recrée la RPC get_highlights avec SELECT *
DROP FUNCTION IF EXISTS sports_data.get_highlights(UUID, INT, TIMESTAMPTZ, UUID, UUID);

CREATE FUNCTION sports_data.get_highlights(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_sport_id UUID DEFAULT NULL,
  p_league_id UUID DEFAULT NULL
)
RETURNS TABLE(
  -- Tous les champs de la table highlights
  id UUID,
  highlightly_id INT,
  title TEXT,
  description TEXT,
  type TEXT,
  video_url TEXT,
  embed_url TEXT,
  image_url TEXT,
  duration_seconds INT,
  provider TEXT,
  source TEXT,
  sport_id UUID,
  league_id UUID,
  home_team_id UUID,
  away_team_id UUID,
  fixture_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  
  -- Enrichissements calculés
  relevance_score INT,
  match_reason TEXT,
  league JSONB,
  home_team JSONB,
  away_team JSONB,
  match JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH user_prefs AS (
    SELECT 
      COALESCE(array_agg(team_id) FILTER (WHERE entity_type = 'team'), ARRAY[]::UUID[]) as fav_teams,
      COALESCE(array_agg(league_id) FILTER (WHERE entity_type = 'league'), ARRAY[]::UUID[]) as fav_leagues,
      COALESCE(array_agg(sport_id) FILTER (WHERE entity_type = 'sport'), ARRAY[]::UUID[]) as fav_sports
    FROM user_preferences
    WHERE user_id = p_user_id AND p_user_id IS NOT NULL
  )
  SELECT 
    h.*,  -- Tous les champs de highlights automatiquement
    
    -- Score de pertinence
    CASE WHEN p_user_id IS NOT NULL THEN
      (
        CASE WHEN h.home_team_id = ANY(up.fav_teams) OR h.away_team_id = ANY(up.fav_teams) THEN 20 ELSE 0 END +
        CASE WHEN h.league_id = ANY(up.fav_leagues) THEN 12 ELSE 0 END +
        CASE WHEN h.sport_id = ANY(up.fav_sports) THEN 15 ELSE 0 END +
        CASE 
          WHEN h.created_at > NOW() - INTERVAL '3 hours' THEN 8
          WHEN h.created_at > NOW() - INTERVAL '12 hours' THEN 5
          ELSE 2
        END
      )
    ELSE 0 END::INT as relevance_score,
    
    -- Raison du match
    CASE WHEN p_user_id IS NOT NULL THEN
      CASE
        WHEN h.home_team_id = ANY(up.fav_teams) OR h.away_team_id = ANY(up.fav_teams) THEN 'Favorite team'
        WHEN h.league_id = ANY(up.fav_leagues) THEN 'Favorite league'
        WHEN h.sport_id = ANY(up.fav_sports) THEN 'Favorite sport'
        ELSE 'Recent'
      END
    ELSE 'Recent' END as match_reason,
    
    -- Relations JSONB
    jsonb_build_object('id', l.id, 'name', l.name, 'logo', l.logo, 'slug', l.slug) as league,
    jsonb_build_object('id', ht.id, 'name', ht.name, 'logo', ht.logo, 'abbreviation', ht.abbreviation) as home_team,
    jsonb_build_object('id', at.id, 'name', at.name, 'logo', at.logo, 'abbreviation', at.abbreviation) as away_team,
    
    -- Infos du match si disponible
    CASE WHEN m.id IS NOT NULL THEN
      jsonb_build_object('id', m.id, 'starts_at', m.starts_at, 'score', m.score)
    ELSE NULL END as match
    
  FROM sports_data.highlights h
  CROSS JOIN user_prefs up
  LEFT JOIN sports_data.league l ON h.league_id = l.id
  LEFT JOIN sports_data.teams ht ON h.home_team_id = ht.id
  LEFT JOIN sports_data.teams at ON h.away_team_id = at.id
  LEFT JOIN sports_data.fixtures m ON h.fixture_id = m.id
  WHERE 
    (p_cursor IS NULL OR h.created_at < p_cursor)
    AND (p_sport_id IS NULL OR h.sport_id = p_sport_id)
    AND (p_league_id IS NULL OR h.league_id = p_league_id)
  ORDER BY 
    CASE WHEN p_user_id IS NOT NULL THEN relevance_score ELSE 0 END DESC,
    h.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;