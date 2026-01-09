-- Add 'player' to entity_type_enum
ALTER TYPE entity_type_enum ADD VALUE IF NOT EXISTS 'player';

-- Add player_id column to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS player_id BIGINT REFERENCES players(id) ON DELETE CASCADE;

-- Create index for player follow queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_player_id 
ON user_preferences(player_id) WHERE player_id IS NOT NULL;