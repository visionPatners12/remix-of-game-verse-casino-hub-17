-- Phase 1: Index stratégiques pour highlights
-- Index BRIN sur created_at (optimal pour données séquentielles)
CREATE INDEX IF NOT EXISTS highlights_created_at_brin_idx 
ON sports_data.highlights USING BRIN (created_at)
WITH (pages_per_range = 128);

-- Index composite pour filtres personnalisés
CREATE INDEX IF NOT EXISTS highlights_personalized_idx 
ON sports_data.highlights (league_id, home_team_id, away_team_id, created_at DESC);

-- Phase 2: RPC flexible unique pour tous les cas d'usage
CREATE OR REPLACE FUNCTION sports_data.get_highlights(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_sport_id UUID DEFAULT NULL,
  p_league_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  video_url TEXT,
  embed_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  relevance_score INT,
  match_reason TEXT,
  league JSONB,
  home_team JSONB,
  away_team JSONB
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
    h.id,
    h.title,
    h.video_url,
    h.embed_url,
    h.image_url,
    h.created_at,
    -- Score (0 si pas d'user_id)
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
    -- Raison
    CASE WHEN p_user_id IS NOT NULL THEN
      CASE
        WHEN h.home_team_id = ANY(up.fav_teams) OR h.away_team_id = ANY(up.fav_teams) THEN 'Favorite team'
        WHEN h.league_id = ANY(up.fav_leagues) THEN 'Favorite league'
        WHEN h.sport_id = ANY(up.fav_sports) THEN 'Favorite sport'
        ELSE 'Recent'
      END
    ELSE 'Recent' END as match_reason,
    -- JOINs optimisés
    jsonb_build_object('id', l.id, 'name', l.name, 'logo', l.logo, 'slug', l.slug) as league,
    jsonb_build_object('id', ht.id, 'name', ht.name, 'logo', ht.logo, 'abbreviation', ht.abbreviation) as home_team,
    jsonb_build_object('id', at.id, 'name', at.name, 'logo', at.logo, 'abbreviation', at.abbreviation) as away_team
  FROM sports_data.highlights h
  LEFT JOIN user_prefs up ON p_user_id IS NOT NULL
  LEFT JOIN sports_data.league l ON h.league_id = l.id
  LEFT JOIN sports_data.team ht ON h.home_team_id = ht.id
  LEFT JOIN sports_data.team at ON h.away_team_id = at.id
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