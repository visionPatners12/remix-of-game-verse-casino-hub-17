-- Activer l'extension pg_trgm pour la recherche fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Créer des indexes pour optimiser la recherche sur les usernames
CREATE INDEX IF NOT EXISTS idx_users_username_search ON public.users USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_first_name_search ON public.users USING gin(first_name gin_trgm_ops);  
CREATE INDEX IF NOT EXISTS idx_users_last_name_search ON public.users USING gin(last_name gin_trgm_ops);

-- Index pour optimiser les recherches par préfixe
CREATE INDEX IF NOT EXISTS idx_users_username_prefix ON public.users (username text_pattern_ops);

-- RLS policy pour permettre la recherche publique d'utilisateurs
DROP POLICY IF EXISTS "Users can search other users" ON public.users;
CREATE POLICY "Users can search other users" 
ON public.users 
FOR SELECT 
USING (true);

-- Fonction pour la recherche optimisée d'utilisateurs
CREATE OR REPLACE FUNCTION public.search_users(search_term text, limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  similarity_score real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    GREATEST(
      COALESCE(similarity(COALESCE(u.username, ''), search_term), 0),
      COALESCE(similarity(COALESCE(u.first_name, ''), search_term), 0),
      COALESCE(similarity(COALESCE(u.last_name, ''), search_term), 0)
    ) as similarity_score
  FROM public.users u
  WHERE 
    u.username IS NOT NULL AND
    length(trim(search_term)) > 0 AND
    (
      u.username ILIKE search_term || '%' OR
      u.first_name ILIKE search_term || '%' OR
      u.last_name ILIKE search_term || '%' OR
      (length(search_term) >= 3 AND (
        u.username % search_term OR
        u.first_name % search_term OR
        u.last_name % search_term
      ))
    )
  ORDER BY 
    -- Priorité aux correspondances exactes au début
    CASE 
      WHEN u.username ILIKE search_term || '%' THEN 1
      WHEN u.first_name ILIKE search_term || '%' THEN 2
      WHEN u.last_name ILIKE search_term || '%' THEN 3
      ELSE 4
    END,
    similarity_score DESC,
    u.username
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;