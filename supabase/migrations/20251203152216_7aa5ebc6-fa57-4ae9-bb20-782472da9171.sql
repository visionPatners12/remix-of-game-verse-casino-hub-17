-- Fix player_id type: change from BIGINT to UUID to match sports_data.players.id

-- Drop the existing column and index
DROP INDEX IF EXISTS idx_user_preferences_player_id;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS player_id;

-- Add player_id as UUID (sports_data.players.id is UUID)
ALTER TABLE user_preferences 
ADD COLUMN player_id UUID;

-- Create index for performance
CREATE INDEX idx_user_preferences_player_id 
ON user_preferences(player_id) WHERE player_id IS NOT NULL;