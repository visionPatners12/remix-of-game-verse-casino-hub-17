-- =====================================================
-- Create search_leagues_sports_data RPC function
-- Table is sports_data.league (singular)
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_leagues_sports_data(
  q text,
  favorite_sport_ids uuid[] DEFAULT '{}'::uuid[],
  n integer DEFAULT 15,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  league_id uuid,
  league_name text,
  league_slug text,
  league_logo text,
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
    l.id as league_id,
    l.name as league_name,
    l.slug as league_slug,
    l.logo as league_logo,
    l.country_id,
    c.name as country_name,
    l.sport_id,
    s.name as sport_name,
    s.slug as sport_slug,
    s.icon_name as sport_icon,
    COALESCE(fc.followers_count, 0)::bigint as followers_count,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN l.sport_id = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
        COALESCE(fc.followers_count, 0) DESC,
        COALESCE(l.view_count, 0) DESC,
        similarity(lower(l.name), lower(q)) DESC
    )::bigint as rank
  FROM sports_data.league l
  LEFT JOIN sports_data.sport s ON l.sport_id = s.id
  LEFT JOIN sports_data.country c ON l.country_id = c.id
  LEFT JOIN (
    SELECT up.league_id as lid, COUNT(*)::bigint as followers_count
    FROM public.user_preferences up
    WHERE up.league_id IS NOT NULL
    GROUP BY up.league_id
  ) fc ON fc.lid = l.id
  WHERE 
    l.name ILIKE '%' || q || '%'
    OR l.slug ILIKE '%' || q || '%'
    OR COALESCE(l.norm_name, '') ILIKE '%' || q || '%'
  ORDER BY rank
  LIMIT n
  OFFSET page_offset;
$$ LANGUAGE sql STABLE;