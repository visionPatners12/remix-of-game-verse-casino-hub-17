-- Create immutable wrapper function for unaccent
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
SELECT unaccent($1);
$$;

-- Create trigram index for optimized team search
CREATE INDEX IF NOT EXISTS teams_name_trgm_idx
ON public.teams USING gin (lower(immutable_unaccent(name)) gin_trgm_ops);

-- Optimized team search function with intelligent ranking
CREATE OR REPLACE FUNCTION public.search_teams(q text, n int DEFAULT 10)
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
  rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH norm AS (SELECT lower(immutable_unaccent(q)) AS q)
SELECT
  t.id   AS team_id,
  t.name AS team_name,
  t.slug AS team_slug,
  t.logo AS team_logo,
  c.id   AS country_id,
  c.name AS country_name,
  c.slug AS country_slug,
  s.id   AS sport_id,
  s.name AS sport_name,
  s.slug AS sport_slug,
  (
    -- Boost exact & prefix
    (CASE WHEN lower(immutable_unaccent(t.name)) = norm.q THEN 100 ELSE 0 END) +
    (CASE WHEN lower(immutable_unaccent(t.name)) LIKE norm.q || '%' THEN 60 ELSE 0 END) +
    -- Fuzzy (trigram similarity)
    (similarity(lower(immutable_unaccent(t.name)), norm.q) * 20)
  )::real AS rank
FROM public.teams t
LEFT JOIN public.country c ON c.id = t.country_id
LEFT JOIN public.sports  s ON s.id = t.sport_id, norm
WHERE
  length(trim(norm.q)) > 0
  AND (
    -- Prefix search (fast with index)
    lower(immutable_unaccent(t.name)) LIKE norm.q || '%'
    -- Fuzzy search (trigram)
    OR lower(immutable_unaccent(t.name)) % norm.q
  )
ORDER BY rank DESC
LIMIT n;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_teams(text,int) TO anon, authenticated;