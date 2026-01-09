-- Add column to track when player stats were last fetched from API
ALTER TABLE sports_data.players 
ADD COLUMN IF NOT EXISTS stats_last_fetched_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient cache check queries
CREATE INDEX IF NOT EXISTS idx_players_stats_last_fetched 
ON sports_data.players(stats_last_fetched_at);

-- Add comment to document the column purpose
COMMENT ON COLUMN sports_data.players.stats_last_fetched_at IS 'Timestamp of when per_season stats were last fetched from Highlightly API. Used for cache invalidation (24h TTL).';