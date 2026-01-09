-- Update search_users function to include view_count in ranking
CREATE OR REPLACE FUNCTION public.search_users(
  search_term TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  similarity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    (
      CASE 
        WHEN u.username ILIKE search_term || '%' THEN 1.0
        WHEN u.first_name ILIKE search_term || '%' OR u.last_name ILIKE search_term || '%' THEN 0.9
        WHEN u.username ILIKE '%' || search_term || '%' THEN 0.7
        WHEN u.first_name ILIKE '%' || search_term || '%' OR u.last_name ILIKE '%' || search_term || '%' THEN 0.6
        ELSE 0.5
      END
      + (LEAST(COALESCE(u.view_count, 0), 1000)::NUMERIC / 1000.0)
    ) AS similarity_score
  FROM public.users u
  WHERE u.is_profile_public = true
    AND (
      u.username ILIKE '%' || search_term || '%'
      OR u.first_name ILIKE '%' || search_term || '%'  
      OR u.last_name ILIKE '%' || search_term || '%'
    )
  ORDER BY 
    similarity_score DESC,
    COALESCE(u.view_count, 0) DESC,
    u.username ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update search_teams_sports_data to include view_count in ranking
CREATE OR REPLACE FUNCTION public.search_teams_sports_data(
  q text,
  n integer DEFAULT 10,
  sport_filter_id uuid DEFAULT NULL,
  favorite_sport_ids uuid[] DEFAULT '{}'::uuid[],
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  team_id uuid,
  team_name text,
  team_slug text,
  team_logo text,
  country_id uuid,
  country_name text,
  country_slug text,
  sport_id uuid,
  sport_name text,
  sport_slug text,
  sport_icon text,
  rank real
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  norm_q text := lower(trim(q));
BEGIN
  RETURN QUERY
  SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.slug AS team_slug,
    t.logo AS team_logo,
    c.id AS country_id,
    c.name AS country_name,
    c.slug AS country_slug,
    s.id AS sport_id,
    s.name AS sport_name,
    s.slug AS sport_slug,
    s.icon AS sport_icon,
    (
      CASE WHEN s.id = ANY(favorite_sport_ids) THEN 100 ELSE 0 END +
      CASE WHEN lower(t.name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(t.name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      (10.0 - LEAST(length(t.name), 10)::REAL) +
      (LEAST(COALESCE(t.view_count, 0), 1000)::REAL / 100.0)
    )::REAL AS rank
  FROM sports_data.teams t
  JOIN sports_data.country c ON t.country_id = c.id
  JOIN sports_data.sport s ON c.sport_id = s.id
  WHERE lower(t.name) LIKE '%' || norm_q || '%'
    AND (sport_filter_id IS NULL OR s.id = sport_filter_id)
  ORDER BY
    CASE WHEN s.id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
    CASE WHEN lower(t.name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    COALESCE(t.view_count, 0) DESC,
    length(t.name),
    t.name
  LIMIT n
  OFFSET page_offset;
END;
$$;

-- Update search_leagues_sports_data to include view_count in ranking
CREATE OR REPLACE FUNCTION public.search_leagues_sports_data(
  q text,
  n integer DEFAULT 10,
  sport_filter_id uuid DEFAULT NULL,
  favorite_sport_ids uuid[] DEFAULT '{}'::uuid[],
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  league_id uuid,
  league_name text,
  league_slug text,
  league_logo text,
  country_id uuid,
  country_name text,
  country_slug text,
  sport_id uuid,
  sport_name text,
  sport_slug text,
  sport_icon text,
  rank real
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  norm_q text := lower(trim(q));
BEGIN
  RETURN QUERY
  SELECT
    l.id AS league_id,
    l.name AS league_name,
    l.slug AS league_slug,
    l.logo AS league_logo,
    c.id AS country_id,
    c.name AS country_name,
    c.slug AS country_slug,
    s.id AS sport_id,
    s.name AS sport_name,
    s.slug AS sport_slug,
    s.icon AS sport_icon,
    (
      CASE WHEN s.id = ANY(favorite_sport_ids) THEN 100 ELSE 0 END +
      CASE WHEN lower(l.name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(l.name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      (10.0 - LEAST(length(l.name), 10)::REAL) +
      (LEAST(COALESCE(l.view_count, 0), 1000)::REAL / 100.0)
    )::REAL AS rank
  FROM sports_data.league l
  JOIN sports_data.country c ON l.country_id = c.id
  JOIN sports_data.sport s ON c.sport_id = s.id
  WHERE lower(l.name) LIKE '%' || norm_q || '%'
    AND (sport_filter_id IS NULL OR s.id = sport_filter_id)
  ORDER BY
    CASE WHEN s.id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
    CASE WHEN lower(l.name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    COALESCE(l.view_count, 0) DESC,
    length(l.name),
    l.name
  LIMIT n
  OFFSET page_offset;
END;
$$;

-- Update search_players_sports_data to include view_count in ranking
CREATE OR REPLACE FUNCTION public.search_players_sports_data(
  q text,
  n integer DEFAULT 10,
  favorite_sport_ids uuid[] DEFAULT '{}'::uuid[],
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  player_id text,
  player_name text,
  player_logo text,
  team_name text,
  sport_id uuid,
  sport_name text,
  sport_slug text,
  sport_icon text,
  rank real
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  norm_q text := lower(trim(q));
BEGIN
  RETURN QUERY
  SELECT
    p.id::text AS player_id,
    p.full_name AS player_name,
    p.logo AS player_logo,
    COALESCE((p.profile->>'team_name')::text, '') AS team_name,
    s.id AS sport_id,
    s.name AS sport_name,
    s.slug AS sport_slug,
    s.icon AS sport_icon,
    (
      CASE WHEN s.id = ANY(favorite_sport_ids) THEN 100 ELSE 0 END +
      CASE WHEN lower(p.full_name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(p.full_name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      (10.0 - LEAST(length(p.full_name), 10)::REAL) +
      (LEAST(COALESCE(p.view_count, 0), 1000)::REAL / 100.0)
    )::REAL AS rank
  FROM public.players p
  LEFT JOIN sports_data.sport s ON lower(p.sport) = lower(s.slug)
  WHERE lower(p.full_name) LIKE '%' || norm_q || '%'
  ORDER BY
    CASE WHEN s.id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
    CASE WHEN lower(p.full_name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    COALESCE(p.view_count, 0) DESC,
    length(p.full_name),
    p.full_name
  LIMIT n
  OFFSET page_offset;
END;
$$;