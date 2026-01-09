-- Create search_users function for user search functionality
CREATE OR REPLACE FUNCTION search_users(
  search_term TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  similarity_score NUMERIC
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
      WHEN u.first_name ILIKE search_term || '%' OR u.last_name ILIKE search_term || '%' THEN 0.9
      WHEN u.username ILIKE '%' || search_term || '%' THEN 0.7
      WHEN u.first_name ILIKE '%' || search_term || '%' OR u.last_name ILIKE '%' || search_term || '%' THEN 0.6
      ELSE 0.5
    END AS similarity_score
  FROM users u
  WHERE u.username ILIKE '%' || search_term || '%'
     OR u.first_name ILIKE '%' || search_term || '%'  
     OR u.last_name ILIKE '%' || search_term || '%'
  ORDER BY similarity_score DESC, u.username ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;