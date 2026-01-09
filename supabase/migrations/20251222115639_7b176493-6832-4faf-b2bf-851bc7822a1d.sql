CREATE OR REPLACE FUNCTION public.get_highlights(
  p_user_id uuid DEFAULT NULL,
  p_sport_id uuid DEFAULT NULL,
  p_league_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_cursor text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  highlightly_id bigint,
  title text,
  description text,
  type text,
  video_url text,
  embed_url text,
  image_url text,
  duration_seconds integer,
  provider text,
  source text,
  sport_id uuid,
  league_id uuid,
  home_team_id uuid,
  away_team_id uuid,
  fixture_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  match_date date,
  relevance_score integer,
  match_reason text,
  league jsonb,
  home_team jsonb,
  away_team jsonb,
  match jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
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
    h.match_date,
    1 AS relevance_score,
    'recent'::text AS match_reason,
    CASE WHEN l.id IS NOT NULL THEN jsonb_build_object('id', l.id, 'name', l.name, 'logo', l.logo, 'slug', l.slug) ELSE NULL END,
    CASE WHEN ht.id IS NOT NULL THEN jsonb_build_object('id', ht.id, 'name', ht.name, 'logo', ht.logo, 'abbreviation', ht.abbreviation) ELSE NULL END,
    CASE WHEN at.id IS NOT NULL THEN jsonb_build_object('id', at.id, 'name', at.name, 'logo', at.logo, 'abbreviation', at.abbreviation) ELSE NULL END,
    CASE WHEN m.id IS NOT NULL THEN jsonb_build_object(
      'id', m.id, 
      'starts_at', m.starts_at, 
      'score', m.states->'score',
      'stage', m.stage,
      'round', m.round
    ) ELSE NULL END
  FROM sports_data.highlights h
  LEFT JOIN sports_data.league l ON l.id = h.league_id
  LEFT JOIN sports_data.teams ht ON ht.id = h.home_team_id
  LEFT JOIN sports_data.teams at ON at.id = h.away_team_id
  LEFT JOIN sports_data.match m ON m.highlightly_id = h.match_highlightly_id
  WHERE
    (p_sport_id IS NULL OR h.sport_id = p_sport_id)
    AND (p_league_id IS NULL OR h.league_id = p_league_id)
    AND (p_cursor IS NULL OR h.created_at < p_cursor::timestamptz)
  ORDER BY h.match_date DESC, h.created_at DESC
  LIMIT p_limit;
END;
$$;