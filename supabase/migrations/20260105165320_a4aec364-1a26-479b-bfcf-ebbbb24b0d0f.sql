-- Update hashtag_counts_24h view to include polymarket_predictions
CREATE OR REPLACE VIEW social_post.hashtag_counts_24h AS
SELECT hashtag,
    count(*) AS nb_posts_24h
FROM (
    -- Predictions classiques
    SELECT unnest(p.hashtags) AS hashtag
    FROM social_post.predictions p
    WHERE p.visibility = 'public' 
      AND p.created_at >= (now() - '24:00:00'::interval)
    
    UNION ALL
    
    -- Bets
    SELECT unnest(b.hashtags) AS hashtag
    FROM social_post.bets b
    WHERE b.visibility = 'public' 
      AND b.created_at >= (now() - '24:00:00'::interval)
    
    UNION ALL
    
    -- Simple posts
    SELECT unnest(s.hashtags) AS hashtag
    FROM social_post.simple_posts s
    WHERE COALESCE(s.is_deleted, false) = false 
      AND s.created_at >= (now() - '24:00:00'::interval)
    
    UNION ALL
    
    -- Polymarket predictions
    SELECT unnest(pm.hashtags) AS hashtag
    FROM social_post.polymarket_predictions pm
    WHERE pm.visibility = 'public' 
      AND pm.created_at >= (now() - '24:00:00'::interval)
) x
GROUP BY hashtag
ORDER BY count(*) DESC;