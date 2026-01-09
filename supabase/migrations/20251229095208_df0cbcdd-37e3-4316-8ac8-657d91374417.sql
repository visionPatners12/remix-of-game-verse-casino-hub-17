-- Create batch function to get reactions for highlights and matches in one call
CREATE OR REPLACE FUNCTION social_post.rpc_batch_feed_reactions(
  p_highlight_ids uuid[] DEFAULT '{}',
  p_match_ids uuid[] DEFAULT '{}',
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  item_type text,
  item_id uuid,
  likes_count integer,
  comments_count integer,
  user_liked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'social_post', 'public'
AS $$
  -- Highlights reactions
  SELECT 
    'highlight'::text AS item_type,
    h.id AS item_id,
    COALESCE((SELECT COUNT(*)::integer FROM social_post.highlight_likes hl WHERE hl.highlight_id = h.id), 0) AS likes_count,
    COALESCE((SELECT COUNT(*)::integer FROM social_post.highlight_comments hc WHERE hc.highlight_id = h.id AND NOT hc.is_deleted), 0) AS comments_count,
    COALESCE((SELECT EXISTS(SELECT 1 FROM social_post.highlight_likes ul WHERE ul.highlight_id = h.id AND ul.user_id = p_user_id)), false) AS user_liked
  FROM unnest(p_highlight_ids) AS h(id)
  
  UNION ALL
  
  -- Match reactions
  SELECT 
    'match'::text AS item_type,
    m.id AS item_id,
    COALESCE((SELECT COUNT(*)::integer FROM social_post.match_likes ml WHERE ml.match_id = m.id), 0) AS likes_count,
    COALESCE((SELECT COUNT(*)::integer FROM social_post.match_comments mc WHERE mc.match_id = m.id AND NOT mc.is_deleted), 0) AS comments_count,
    COALESCE((SELECT EXISTS(SELECT 1 FROM social_post.match_likes ul WHERE ul.match_id = m.id AND ul.user_id = p_user_id)), false) AS user_liked
  FROM unnest(p_match_ids) AS m(id);
$$;

-- Grant execute to authenticated and anon users
GRANT EXECUTE ON FUNCTION social_post.rpc_batch_feed_reactions(uuid[], uuid[], uuid) TO authenticated, anon;