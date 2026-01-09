-- Migrate existing wallet data from 'polygon' to 'eip155:137' (Polygon) format
-- This ensures consistency with EIP-155 chain identification standards

UPDATE user_wallet 
SET chain = 'eip155:137', updated_at = now()
WHERE chain = 'polygon';

-- Add an index for better performance on chain lookups
CREATE INDEX IF NOT EXISTS idx_user_wallet_chain ON user_wallet(chain);

-- Add an index for better performance on user_id + chain lookups
CREATE INDEX IF NOT EXISTS idx_user_wallet_user_chain ON user_wallet(user_id, chain);