-- Corriger la fonction de recherche avec un search_path sécurisé
CREATE OR REPLACE FUNCTION public.search_users(search_term text, limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  similarity_score real
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;