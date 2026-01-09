-- =====================================================
-- Recreate search_players_sports_data with correct joins
-- p.sport is UUID, p.team is UUID
-- =====================================================

DROP FUNCTION IF EXISTS public.search_players_sports_data(text, uuid[], integer, integer);

CREATE OR REPLACE FUNCTION public.search_players_sports_data(
  q text,
  favorite_sport_ids uuid[] DEFAULT '{}'::uuid[],
  n integer DEFAULT 15,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  player_id uuid,
  player_name text,
  player_full_name text,
  player_logo text,
  team_id uuid,
  team_name text,
  sport_id uuid,
  sport_name text,
  sport_slug text,
  sport_icon text,
  followers_count bigint,
  rank bigint
)
AS $$
  SELECT 
    p.id as player_id,
    p.name as player_name,
    p.full_name as player_full_name,
    p.logo as player_logo,
    p.team as team_id,
    t.name as team_name,
    s.id as sport_id,
    s.name as sport_name,
    s.slug as sport_slug,
    s.icon_name as sport_icon,
    COALESCE(fc.followers_count, 0)::bigint as followers_count,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN p.sport = ANY(favorite_sport_ids) THEN 0 ELSE 1 END,
        COALESCE(fc.followers_count, 0) DESC,
        similarity(lower(COALESCE(p.full_name, p.name)), lower(q)) DESC
    )::bigint as rank
  FROM sports_data.players p
  LEFT JOIN sports_data.teams t ON t.id = p.team
  LEFT JOIN sports_data.sport s ON s.id = p.sport
  LEFT JOIN (
    SELECT up.player_id as pid, COUNT(*)::bigint as followers_count
    FROM public.user_preferences up
    WHERE up.player_id IS NOT NULL
    GROUP BY up.player_id
  ) fc ON fc.pid = p.id
  WHERE 
    p.name ILIKE '%' || q || '%'
    OR p.full_name ILIKE '%' || q || '%'
  ORDER BY rank
  LIMIT n
  OFFSET page_offset;
$$ LANGUAGE sql STABLE;