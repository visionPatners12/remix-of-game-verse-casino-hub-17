-- Update search_users function to match from the beginning only
CREATE OR REPLACE FUNCTION search_users(search_term text, limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  similarity_score numeric
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
    CASE 
      WHEN u.username ILIKE search_term || '%' THEN 1.0
      WHEN u.first_name ILIKE search_term || '%' THEN 0.9
      WHEN u.last_name ILIKE search_term || '%' THEN 0.8
      ELSE 0.5
    END AS similarity_score
  FROM users u
  WHERE u.username ILIKE search_term || '%'
     OR u.first_name ILIKE search_term || '%'  
     OR u.last_name ILIKE search_term || '%'
  ORDER BY similarity_score DESC, u.username ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;