CREATE OR REPLACE FUNCTION polymarket.search_events_by_tag(
  search_term text,
  result_limit integer DEFAULT 20,
  result_offset integer DEFAULT 0
)
RETURNS TABLE (
  event_id text,
  title text,
  description text,
  image text,
  icon text,
  category text,
  volume numeric,
  liquidity numeric,
  end_date timestamptz,
  active boolean,
  tag_id text,
  tag_label text,
  tag_slug text,
  total_tags_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'polymarket'
AS $$
  WITH matching_tags AS (
    SELECT t.id, t.label, t.slug
    FROM polymarket.tags t
    WHERE t.label ILIKE '%' || search_term || '%'
       OR t.slug ILIKE '%' || search_term || '%'
  ),
  tag_count AS (
    SELECT COUNT(DISTINCT id) as cnt FROM matching_tags
  ),
  ranked_events AS (
    SELECT DISTINCT ON (e.id)
      e.id as event_id,
      e.title,
      e.description,
      e.image,
      e.icon,
      e.category,
      e.volume,
      e.liquidity,
      e.end_date,
      e.active,
      mt.id as tag_id,
      mt.label as tag_label,
      mt.slug as tag_slug
    FROM matching_tags mt
    JOIN polymarket.event_tags et ON et.tag_id = mt.id
    JOIN polymarket.events e ON e.id = et.event_id
    WHERE e.active = true
    ORDER BY e.id, e.volume DESC NULLS LAST
  )
  SELECT 
    re.*,
    tc.cnt as total_tags_count
  FROM ranked_events re
  CROSS JOIN tag_count tc
  ORDER BY re.volume DESC NULLS LAST
  LIMIT result_limit
  OFFSET result_offset;
$$;