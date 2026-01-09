-- =====================================================
-- Phase 1: Optimized Search Functions + Indexes
-- =====================================================

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 1. CREATE OPTIMIZED INDEXES
-- =====================================================

-- GiST indexes for fuzzy search (pg_trgm) on sports_data.league
CREATE INDEX IF NOT EXISTS idx_league_name_gist 
ON sports_data.league USING gist(lower(name) gist_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_league_slug_gist 
ON sports_data.league USING gist(lower(slug) gist_trgm_ops);

-- B-tree indexes for exact/prefix search on sports_data.league
CREATE INDEX IF NOT EXISTS idx_league_name_lower 
ON sports_data.league (lower(name));

CREATE INDEX IF NOT EXISTS idx_league_slug_lower 
ON sports_data.league (lower(slug));

-- GiST index for fuzzy search on sports_data.teams
CREATE INDEX IF NOT EXISTS idx_teams_name_gist 
ON sports_data.teams USING gist(lower(name) gist_trgm_ops);

-- B-tree indexes for exact/prefix search on sports_data.teams
CREATE INDEX IF NOT EXISTS idx_teams_name_lower 
ON sports_data.teams (lower(name));

CREATE INDEX IF NOT EXISTS idx_teams_slug_lower 
ON sports_data.teams (lower(slug));

-- =====================================================
-- 2. RPC FUNCTION: search_leagues_sports_data
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_leagues_sports_data(
  q text,
  n integer DEFAULT 10,
  sport_filter_id uuid DEFAULT NULL
)
RETURNS TABLE(
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, sports_data
AS $$
  WITH normalized_query AS (
    SELECT lower(trim(q)) AS query
  )
  SELECT
    l.id AS league_id,
    l.name AS league_name,
    l.slug AS league_slug,
    l.logo AS league_logo,
    l.country_id,
    c.name AS country_name,
    c.slug AS country_slug,
    s.id AS sport_id,
    s.name AS sport_name,
    s.slug AS sport_slug,
    s.icon_name AS sport_icon,
    (
      -- Exact match on name (highest priority)
      CASE WHEN lower(l.name) = (SELECT query FROM normalized_query) THEN 150 ELSE 0 END +
      
      -- Exact match on slug
      CASE WHEN lower(l.slug) = (SELECT query FROM normalized_query) THEN 140 ELSE 0 END +
      
      -- Prefix match on name
      CASE WHEN lower(l.name) LIKE (SELECT query FROM normalized_query) || '%' THEN 80 ELSE 0 END +
      
      -- Prefix match on slug
      CASE WHEN lower(l.slug) LIKE (SELECT query FROM normalized_query) || '%' THEN 60 ELSE 0 END +
      
      -- Fuzzy match using trigram similarity
      (similarity(lower(l.name), (SELECT query FROM normalized_query)) * 40) +
      (similarity(lower(l.slug), (SELECT query FROM normalized_query)) * 20)
    )::real AS rank
  FROM sports_data.league l
  LEFT JOIN public.country c ON c.id = l.country_id
  LEFT JOIN public.sports s ON s.id = l.sport_id
  CROSS JOIN normalized_query
  WHERE
    length((SELECT query FROM normalized_query)) > 0
    AND (sport_filter_id IS NULL OR l.sport_id = sport_filter_id)
    AND (
      -- Fast exact/prefix checks using B-tree indexes
      lower(l.name) = (SELECT query FROM normalized_query)
      OR lower(l.slug) = (SELECT query FROM normalized_query)
      OR lower(l.name) LIKE (SELECT query FROM normalized_query) || '%'
      OR lower(l.slug) LIKE (SELECT query FROM normalized_query) || '%'
      -- Fuzzy search using GiST indexes (pg_trgm)
      OR similarity(lower(l.name), (SELECT query FROM normalized_query)) > 0.3
      OR similarity(lower(l.slug), (SELECT query FROM normalized_query)) > 0.3
    )
  ORDER BY rank DESC, l.name ASC
  LIMIT n;
$$;

-- =====================================================
-- 3. RPC FUNCTION: search_teams_sports_data
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_teams_sports_data(
  q text,
  n integer DEFAULT 10,
  sport_filter_id uuid DEFAULT NULL
)
RETURNS TABLE(
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, sports_data
AS $$
  WITH normalized_query AS (
    SELECT lower(trim(q)) AS query
  )
  SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.slug AS team_slug,
    t.logo AS team_logo,
    t.country_id,
    c.name AS country_name,
    c.slug AS country_slug,
    s.id AS sport_id,
    s.name AS sport_name,
    s.slug AS sport_slug,
    s.icon_name AS sport_icon,
    (
      -- Exact match on name (highest priority)
      CASE WHEN lower(t.name) = (SELECT query FROM normalized_query) THEN 150 ELSE 0 END +
      
      -- Exact match on slug
      CASE WHEN lower(t.slug) = (SELECT query FROM normalized_query) THEN 140 ELSE 0 END +
      
      -- Prefix match on name
      CASE WHEN lower(t.name) LIKE (SELECT query FROM normalized_query) || '%' THEN 80 ELSE 0 END +
      
      -- Prefix match on slug
      CASE WHEN lower(t.slug) LIKE (SELECT query FROM normalized_query) || '%' THEN 60 ELSE 0 END +
      
      -- Fuzzy match using trigram similarity
      (similarity(lower(t.name), (SELECT query FROM normalized_query)) * 40) +
      (similarity(lower(t.slug), (SELECT query FROM normalized_query)) * 20)
    )::real AS rank
  FROM sports_data.teams t
  LEFT JOIN public.country c ON c.id = t.country_id
  LEFT JOIN public.sports s ON s.id = t.sport_id
  CROSS JOIN normalized_query
  WHERE
    length((SELECT query FROM normalized_query)) > 0
    AND (sport_filter_id IS NULL OR t.sport_id = sport_filter_id)
    AND (
      -- Fast exact/prefix checks using B-tree indexes
      lower(t.name) = (SELECT query FROM normalized_query)
      OR lower(t.slug) = (SELECT query FROM normalized_query)
      OR lower(t.name) LIKE (SELECT query FROM normalized_query) || '%'
      OR lower(t.slug) LIKE (SELECT query FROM normalized_query) || '%'
      -- Fuzzy search using GiST indexes (pg_trgm)
      OR similarity(lower(t.name), (SELECT query FROM normalized_query)) > 0.3
      OR similarity(lower(t.slug), (SELECT query FROM normalized_query)) > 0.3
    )
  ORDER BY rank DESC, t.name ASC
  LIMIT n;
$$;