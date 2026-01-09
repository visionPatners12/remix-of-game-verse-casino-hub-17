-- Optimized RPC function for user suggestions
-- Combines: followers who I don't follow back, shared interests, shared entity preferences
-- Uses CTEs with proper indexing and scoring

CREATE OR REPLACE FUNCTION social_post.get_suggested_users(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  followers_count BIGINT,
  reason TEXT,
  score BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, social_post
AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Users I already follow (exclude from suggestions)
  my_following AS (
    SELECT following_id 
    FROM social_post.user_follows 
    WHERE follower_id = p_user_id
  ),
  
  -- 1. Users who follow me but I don't follow back (priority: 50 points)
  followers_not_followed AS (
    SELECT 
      uf.follower_id as user_id, 
      'follows_you'::TEXT as suggestion_reason, 
      50::BIGINT as base_score
    FROM social_post.user_follows uf
    WHERE uf.following_id = p_user_id
      AND uf.follower_id != p_user_id
      AND NOT EXISTS (SELECT 1 FROM my_following mf WHERE mf.following_id = uf.follower_id)
  ),
  
  -- 2. Users who follow the same people I follow (shared interests: 30 points per overlap)
  shared_following AS (
    SELECT 
      uf.follower_id as user_id, 
      'shared_interests'::TEXT as suggestion_reason,
      (30 * COUNT(*))::BIGINT as base_score
    FROM social_post.user_follows uf
    INNER JOIN my_following mf ON uf.following_id = mf.following_id
    WHERE uf.follower_id != p_user_id
      AND NOT EXISTS (SELECT 1 FROM my_following mf2 WHERE mf2.following_id = uf.follower_id)
    GROUP BY uf.follower_id
  ),
  
  -- 3. Users with shared entity preferences - sports, leagues, teams (20 points per overlap)
  shared_entities AS (
    SELECT 
      up2.user_id,
      'shared_favorites'::TEXT as suggestion_reason,
      (20 * COUNT(DISTINCT COALESCE(up2.sport_id::text, '') || COALESCE(up2.league_id::text, '') || COALESCE(up2.team_id::text, '')))::BIGINT as base_score
    FROM public.user_preferences up1
    INNER JOIN public.user_preferences up2 ON (
      (up1.sport_id IS NOT NULL AND up1.sport_id = up2.sport_id) OR
      (up1.league_id IS NOT NULL AND up1.league_id = up2.league_id) OR
      (up1.team_id IS NOT NULL AND up1.team_id = up2.team_id)
    )
    WHERE up1.user_id = p_user_id
      AND up2.user_id != p_user_id
      AND NOT EXISTS (SELECT 1 FROM my_following mf WHERE mf.following_id = up2.user_id)
    GROUP BY up2.user_id
  ),
  
  -- Combine all candidate sources
  all_candidates AS (
    SELECT user_id, suggestion_reason, base_score FROM followers_not_followed
    UNION ALL
    SELECT user_id, suggestion_reason, base_score FROM shared_following
    UNION ALL
    SELECT user_id, suggestion_reason, base_score FROM shared_entities
  ),
  
  -- Aggregate scores and pick best reason per user
  scored_users AS (
    SELECT 
      ac.user_id,
      -- Pick highest priority reason (follows_you > shared_interests > shared_favorites)
      (ARRAY_AGG(ac.suggestion_reason ORDER BY 
        CASE ac.suggestion_reason 
          WHEN 'follows_you' THEN 1 
          WHEN 'shared_interests' THEN 2 
          ELSE 3 
        END
      ))[1] as primary_reason,
      SUM(ac.base_score)::BIGINT as total_score
    FROM all_candidates ac
    GROUP BY ac.user_id
  ),
  
  -- Get follower counts for ranking boost
  follower_counts AS (
    SELECT 
      following_id, 
      COUNT(*)::BIGINT as cnt
    FROM social_post.user_follows
    GROUP BY following_id
  )
  
  SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    COALESCE(fc.cnt, 0)::BIGINT as followers_count,
    su.primary_reason as reason,
    (su.total_score + LEAST(COALESCE(fc.cnt, 0), 100))::BIGINT as score -- Cap follower bonus at 100
  FROM scored_users su
  INNER JOIN public.users u ON u.id = su.user_id
  LEFT JOIN follower_counts fc ON fc.following_id = su.user_id
  WHERE u.username IS NOT NULL 
    AND u.is_profile_public = true
  ORDER BY score DESC, followers_count DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION social_post.get_suggested_users(UUID, INTEGER) TO authenticated;

-- Create indexes if not exist for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON social_post.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON social_post.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);