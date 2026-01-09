-- Update search_leagues function to include azuro_slug with highest priority
CREATE OR REPLACE FUNCTION public.search_leagues(q text, n integer DEFAULT 10)
 RETURNS TABLE(league_id uuid, league_name text, league_slug text, league_logo text, country_id uuid, country_name text, country_slug text, sport_id uuid, sport_name text, sport_slug text, rank real)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Boost exact matches in azuro_slug (highest priority - Azuro identifier)
    (CASE WHEN lower(l.azuro_slug) = norm.q THEN 150 ELSE 0 END) +
    -- Boost exact matches in name
    (CASE WHEN lower(l.name) = norm.q THEN 100 ELSE 0 END) +
    -- Boost exact matches in slug
    (CASE WHEN lower(l.slug) = norm.q THEN 90 ELSE 0 END) +
    -- Boost prefix matches
    (CASE WHEN lower(l.azuro_slug) LIKE norm.q || '%' THEN 80 ELSE 0 END) +
    (CASE WHEN lower(l.name) LIKE norm.q || '%' THEN 60 ELSE 0 END) +
    (CASE WHEN lower(l.slug) LIKE norm.q || '%' THEN 50 ELSE 0 END) +
    -- Fuzzy trigram similarity (lower priority)
    (similarity(lower(l.name), norm.q) * 20) +
    (similarity(lower(l.azuro_slug), norm.q) * 15) +
    (similarity(lower(l.slug), norm.q) * 10)
  )::real AS rank
FROM public.leagues l
LEFT JOIN public.country c ON c.id = l.country_id
LEFT JOIN public.sports  s ON s.id = l.sport_id, norm
WHERE
  length(trim(norm.q)) > 0
  AND (
    -- Exact and prefix search (fast with index)
    lower(l.azuro_slug) = norm.q
    OR lower(l.azuro_slug) LIKE norm.q || '%'
    OR lower(l.name) LIKE norm.q || '%'
    OR lower(l.slug) LIKE norm.q || '%'
    -- Fuzzy search (trigram)
    OR lower(l.name) % norm.q
    OR lower(l.azuro_slug) % norm.q
    OR lower(l.slug) % norm.q
  )
ORDER BY rank DESC
LIMIT n;
$function$