-- Add columns for on-chain verification
ALTER TABLE tipster_subscriptions 
ADD COLUMN IF NOT EXISTS tx_hash TEXT,
ADD COLUMN IF NOT EXISTS amount DECIMAL(18, 6),
ADD COLUMN IF NOT EXISTS from_address TEXT;

-- Index for efficient polling of pending subscriptions
CREATE INDEX IF NOT EXISTS idx_tipster_subscriptions_pending 
ON tipster_subscriptions(status) WHERE status = 'pending';