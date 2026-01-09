-- Add event_id and hashtags columns to polymarket_predictions
ALTER TABLE social_post.polymarket_predictions 
ADD COLUMN IF NOT EXISTS event_id TEXT,
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';