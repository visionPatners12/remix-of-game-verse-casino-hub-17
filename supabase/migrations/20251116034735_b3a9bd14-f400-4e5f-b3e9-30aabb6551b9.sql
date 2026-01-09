-- ========================================
-- Migration: get_highlights de sports_data → public
-- ========================================

-- Créer la RPC dans le schéma public avec tri par pertinence
CREATE OR REPLACE FUNCTION public.get_highlights(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_sport_id UUID DEFAULT NULL,
  p_league_id UUID DEFAULT NULL
)
RETURNS TABLE(
  -- Champs de la table highlights
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
  
  -- Enrichissements
  relevance_score INT,
  match_reason TEXT,
  league JSONB,
  home_team JSONB,
  away_team JSONB,
  match JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, sports_data
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Champs de base
    h.id,
    h.highlightly_id,
    h.title,
    h.description,
    h.type,
    h.video_url,
    h.embed_url,
    h.image_url,
    h.duration_seconds,
    h.provider,
    h.source,
    h.sport_id,
    h.league_id,
    h.home_team_id,
    h.away_team_id,
    h.fixture_id,
    h.created_at,
    h.updated_at,
    
    -- Calcul du relevance_score basé sur user_preferences
    COALESCE(
      CASE WHEN up.user_id IS NOT NULL THEN
        (CASE WHEN (h.home_team_id = up.team_id OR h.away_team_id = up.team_id) AND up.entity_type = 'team' THEN 20 ELSE 0 END +
         CASE WHEN h.league_id = up.league_id AND up.entity_type = 'league' THEN 12 ELSE 0 END +
         CASE WHEN h.sport_id = up.sport_id AND up.entity_type = 'sport' THEN 15 ELSE 0 END)
      ELSE 0 END, 0
    )::INT as relevance_score,
    
    -- Match reason
    COALESCE(
      CASE WHEN up.user_id IS NOT NULL THEN
        CASE up.entity_type
          WHEN 'team' THEN 'Favorite team'
          WHEN 'league' THEN 'Favorite league'
          WHEN 'sport' THEN 'Favorite sport'
          ELSE 'Recent'
        END
      ELSE 'Recent' END, 'Recent'
    ) as match_reason,
    
    -- Relations enrichies en JSONB
    jsonb_build_object(
      'id', l.id, 
      'name', l.name, 
      'logo', l.logo, 
      'slug', l.slug
    ) as league,
    
    jsonb_build_object(
      'id', ht.id, 
      'name', ht.name, 
      'logo', ht.logo, 
      'abbreviation', ht.abbreviation
    ) as home_team,
    
    jsonb_build_object(
      'id', at.id, 
      'name', at.name, 
      'logo', at.logo, 
      'abbreviation', at.abbreviation
    ) as away_team,
    
    CASE WHEN m.id IS NOT NULL THEN
      jsonb_build_object('id', m.id, 'starts_at', m.starts_at, 'score', m.score)
    ELSE NULL END as match
    
  FROM sports_data.highlights h
  LEFT JOIN public.user_preferences up ON (
    up.user_id = p_user_id 
    AND (
      (up.entity_type = 'team' AND (h.home_team_id = up.team_id OR h.away_team_id = up.team_id))
      OR (up.entity_type = 'league' AND h.league_id = up.league_id)
      OR (up.entity_type = 'sport' AND h.sport_id = up.sport_id)
    )
  )
  LEFT JOIN sports_data.league l ON l.id = h.league_id
  LEFT JOIN sports_data.teams ht ON ht.id = h.home_team_id
  LEFT JOIN sports_data.teams at ON at.id = h.away_team_id
  LEFT JOIN sports_data.fixtures m ON m.id = h.fixture_id
  
  WHERE 
    (p_cursor IS NULL OR h.created_at < p_cursor)
    AND (p_sport_id IS NULL OR h.sport_id = p_sport_id)
    AND (p_league_id IS NULL OR h.league_id = p_league_id)
  
  -- FIX CRITIQUE : Tri par pertinence d'abord, puis date
  ORDER BY 
    relevance_score DESC,
    h.created_at DESC
  
  LIMIT p_limit;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.get_highlights TO authenticated, anon;

COMMENT ON FUNCTION public.get_highlights IS 
'Récupère les highlights avec scoring de pertinence basé sur les préférences utilisateur. Trie par pertinence puis date.';