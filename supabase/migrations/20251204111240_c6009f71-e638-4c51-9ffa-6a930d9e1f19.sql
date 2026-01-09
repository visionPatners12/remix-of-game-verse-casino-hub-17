-- Create search_leagues_sports_data function with server-side sorting
CREATE OR REPLACE FUNCTION public.search_leagues_sports_data(
  q TEXT,
  favorite_sport_ids UUID[] DEFAULT ARRAY[]::UUID[],
  n INT DEFAULT 15,
  page_offset INT DEFAULT 0,
  sport_filter_id UUID DEFAULT NULL
) RETURNS TABLE (
  league_id UUID,
  league_name TEXT,
  league_slug TEXT,
  league_logo TEXT,
  country_id UUID,
  country_name TEXT,
  country_slug TEXT,
  sport_id UUID,
  sport_name TEXT,
  sport_slug TEXT,
  sport_icon TEXT,
  rank REAL
) AS $$
DECLARE
  norm_q TEXT := lower(trim(q));
BEGIN
  IF length(norm_q) < 1 THEN
    RETURN;
  END IF;

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
    s.icon_name AS sport_icon,
    (
      -- Favorite sport bonus (100 points)
      CASE WHEN s.id = ANY(favorite_sport_ids) THEN 100 ELSE 0 END +
      -- Starts with bonus (50 points)
      CASE WHEN lower(l.name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      -- Word starts with bonus (25 points)
      CASE WHEN lower(l.name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      -- Shorter name bonus (up to 10 points)
      (10.0 - LEAST(length(l.name), 10)::REAL)
    )::REAL AS rank
  FROM sports_data.league l
  LEFT JOIN sports_data.country c ON l.country_id = c.id
  LEFT JOIN sports_data.sport s ON l.sport_id = s.id
  WHERE 
    length(norm_q) > 0
    AND (sport_filter_id IS NULL OR l.sport_id = sport_filter_id)
    AND (
      lower(l.name) LIKE '%' || norm_q || '%'
      OR lower(l.slug) LIKE '%' || norm_q || '%'
    )
  ORDER BY
    -- 1. Favorite sports first
    CASE WHEN s.id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
    -- 2. Starts with query first
    CASE WHEN lower(l.name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    -- 3. Word starts with query
    CASE WHEN lower(l.name) ~ ('(^|\s)' || norm_q) THEN 0 ELSE 1 END,
    -- 4. Shorter names first
    length(l.name),
    -- 5. Alphabetical
    l.name
  LIMIT n
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, sports_data;

-- Create search_teams_sports_data function with server-side sorting
CREATE OR REPLACE FUNCTION public.search_teams_sports_data(
  q TEXT,
  favorite_sport_ids UUID[] DEFAULT ARRAY[]::UUID[],
  n INT DEFAULT 15,
  page_offset INT DEFAULT 0,
  sport_filter_id UUID DEFAULT NULL
) RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_slug TEXT,
  team_logo TEXT,
  country_id UUID,
  country_name TEXT,
  country_slug TEXT,
  sport_id UUID,
  sport_name TEXT,
  sport_slug TEXT,
  sport_icon TEXT,
  rank REAL
) AS $$
DECLARE
  norm_q TEXT := lower(trim(q));
BEGIN
  IF length(norm_q) < 1 THEN
    RETURN;
  END IF;

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
    s.icon_name AS sport_icon,
    (
      CASE WHEN s.id = ANY(favorite_sport_ids) THEN 100 ELSE 0 END +
      CASE WHEN lower(t.name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(t.name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      (10.0 - LEAST(length(t.name), 10)::REAL)
    )::REAL AS rank
  FROM sports_data.teams t
  LEFT JOIN sports_data.country c ON t.country_id = c.id
  LEFT JOIN sports_data.sport s ON t.sport_id = s.id
  WHERE 
    length(norm_q) > 0
    AND (sport_filter_id IS NULL OR t.sport_id = sport_filter_id)
    AND (
      lower(t.name) LIKE '%' || norm_q || '%'
      OR lower(t.slug) LIKE '%' || norm_q || '%'
    )
  ORDER BY
    CASE WHEN s.id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
    CASE WHEN lower(t.name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    CASE WHEN lower(t.name) ~ ('(^|\s)' || norm_q) THEN 0 ELSE 1 END,
    length(t.name),
    t.name
  LIMIT n
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, sports_data;

-- Create search_players_sports_data function
CREATE OR REPLACE FUNCTION public.search_players_sports_data(
  q TEXT,
  n INT DEFAULT 15,
  page_offset INT DEFAULT 0
) RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  player_logo TEXT,
  sport_name TEXT,
  sport_icon TEXT,
  team_name TEXT,
  rank REAL
) AS $$
DECLARE
  norm_q TEXT := lower(trim(q));
BEGIN
  IF length(norm_q) < 1 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    p.id AS player_id,
    p.name AS player_name,
    p.logo AS player_logo,
    s.name AS sport_name,
    s.icon_name AS sport_icon,
    t.name AS team_name,
    (
      CASE WHEN lower(p.name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(p.name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      (10.0 - LEAST(length(p.name), 10)::REAL)
    )::REAL AS rank
  FROM sports_data.players p
  LEFT JOIN sports_data.sport s ON p.sport = s.slug
  LEFT JOIN sports_data.teams t ON p.team_id = t.id
  WHERE 
    length(norm_q) > 0
    AND lower(p.name) LIKE '%' || norm_q || '%'
  ORDER BY
    CASE WHEN lower(p.name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    CASE WHEN lower(p.name) ~ ('(^|\s)' || norm_q) THEN 0 ELSE 1 END,
    length(p.name),
    p.name
  LIMIT n
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, sports_data;