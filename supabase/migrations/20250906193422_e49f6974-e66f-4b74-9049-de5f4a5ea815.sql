-- Create trigram index for optimized league search
CREATE INDEX IF NOT EXISTS leagues_name_trgm_idx
ON public.leagues USING gin (lower(name) gin_trgm_ops);

-- Optimized league search function with intelligent ranking
CREATE OR REPLACE FUNCTION public.search_leagues(q text, n int DEFAULT 10)
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
  rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH norm AS (SELECT lower(q) AS q)
SELECT
  l.id   AS league_id,
  l.name AS league_name,
  l.slug AS league_slug,
  l.logo AS league_logo,
  c.id   AS country_id,
  c.name AS country_name,
  c.slug AS country_slug,
  s.id   AS sport_id,
  s.name AS sport_name,
  s.slug AS sport_slug,
  (
    -- Boost exact & prefix matches
    (CASE WHEN lower(l.name) = norm.q THEN 100 ELSE 0 END) +
    (CASE WHEN lower(l.name) LIKE norm.q || '%' THEN 60 ELSE 0 END) +
    -- Fuzzy trigram similarity
    (similarity(lower(l.name), norm.q) * 20)
  )::real AS rank
FROM public.leagues l
LEFT JOIN public.country c ON c.id = l.country_id
LEFT JOIN public.sports  s ON s.id = l.sport_id, norm
WHERE
  length(trim(norm.q)) > 0
  AND (
    -- Prefix search (fast with index)
    lower(l.name) LIKE norm.q || '%'
    -- Fuzzy search (trigram)
    OR lower(l.name) % norm.q
  )
ORDER BY rank DESC
LIMIT n;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_leagues(text,int) TO anon, authenticated;