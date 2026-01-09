-- Add clob_token_id column to polymarket_predictions for trading integration
ALTER TABLE social_post.polymarket_predictions
ADD COLUMN IF NOT EXISTS clob_token_id TEXT;