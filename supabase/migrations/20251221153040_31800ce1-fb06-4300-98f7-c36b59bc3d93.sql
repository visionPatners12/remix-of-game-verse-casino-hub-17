-- =====================================================
-- Create search_teams_sports_data RPC function
-- Table is sports_data.teams (plural)
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_teams_sports_data(
  q text,
  favorite_sport_ids uuid[] DEFAULT '{}'::uuid[],
  n integer DEFAULT 15,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  team_id uuid,
  team_name text,
  team_slug text,
  team_logo text,
  country_id uuid,
  country_name text,
  sport_id uuid,
  sport_name text,
  sport_slug text,
  sport_icon text,
  followers_count bigint,
  rank bigint
)
AS $$
  SELECT 
    t.id as team_id,
    t.name as team_name,
    t.slug as team_slug,
    t.logo as team_logo,
    t.country_id,
    c.name as country_name,
    t.sport_id,
    s.name as sport_name,
    s.slug as sport_slug,
    s.icon_name as sport_icon,
    COALESCE(fc.followers_count, 0)::bigint as followers_count,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN t.sport_id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
        COALESCE(fc.followers_count, 0) DESC,
        COALESCE(t.view_count, 0) DESC,
        similarity(lower(t.name), lower(q)) DESC
    )::bigint as rank
  FROM sports_data.teams t
  LEFT JOIN sports_data.sport s ON t.sport_id = s.id
  LEFT JOIN sports_data.country c ON t.country_id = c.id
  LEFT JOIN (
    SELECT up.team_id as tid, COUNT(*)::bigint as followers_count
    FROM public.user_preferences up
    WHERE up.team_id IS NOT NULL
    GROUP BY up.team_id
  ) fc ON fc.tid = t.id
  WHERE 
    t.name ILIKE '%' || q || '%'
    OR t.slug ILIKE '%' || q || '%'
    OR COALESCE(t.norm_name, '') ILIKE '%' || q || '%'
  ORDER BY rank
  LIMIT n
  OFFSET page_offset;
$$ LANGUAGE sql STABLE;