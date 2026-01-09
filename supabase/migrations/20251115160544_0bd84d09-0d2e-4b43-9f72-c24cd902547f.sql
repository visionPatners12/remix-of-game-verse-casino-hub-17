-- Drop the old function that returns JSON
DROP FUNCTION IF EXISTS social_post.get_follow_stats(UUID);

-- Create new function that returns TABLE
CREATE OR REPLACE FUNCTION social_post.get_follow_stats(user_id UUID)
RETURNS TABLE(followers BIGINT, following BIGINT) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM social_post.user_follows WHERE following_id = user_id)::BIGINT AS followers,
    (SELECT COUNT(*) FROM social_post.user_follows WHERE follower_id = user_id)::BIGINT AS following;
END;
$$;