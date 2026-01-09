-- Fix the search_players_sports_data function with correct column references
CREATE OR REPLACE FUNCTION public.search_players_sports_data(
  q TEXT,
  favorite_sport_ids UUID[] DEFAULT ARRAY[]::UUID[],
  n INT DEFAULT 15,
  page_offset INT DEFAULT 0
) RETURNS TABLE (
  player_id TEXT,
  player_name TEXT,
  player_logo TEXT,
  sport_id UUID,
  sport_name TEXT,
  sport_slug TEXT,
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
    p.id::TEXT AS player_id,
    p.name AS player_name,
    p.logo AS player_logo,
    s.id AS sport_id,
    s.name AS sport_name,
    s.slug AS sport_slug,
    s.icon_name AS sport_icon,
    t.name AS team_name,
    (
      CASE WHEN s.id = ANY(favorite_sport_ids) THEN 100 ELSE 0 END +
      CASE WHEN lower(p.name) LIKE norm_q || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(p.name) ~ ('(^|\s)' || norm_q) THEN 25 ELSE 0 END +
      (10.0 - LEAST(length(p.name), 10)::REAL)
    )::REAL AS rank
  FROM sports_data.players p
  LEFT JOIN sports_data.sport s ON p.sport = s.id
  LEFT JOIN sports_data.teams t ON p.team = t.id
  WHERE 
    length(norm_q) > 0
    AND lower(p.name) LIKE '%' || norm_q || '%'
  ORDER BY
    CASE WHEN s.id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
    CASE WHEN lower(p.name) LIKE norm_q || '%' THEN 0 ELSE 1 END,
    CASE WHEN lower(p.name) ~ ('(^|\s)' || norm_q) THEN 0 ELSE 1 END,
    length(p.name),
    p.name
  LIMIT n
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, sports_data;