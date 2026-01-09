-- Create entity_follows table in social_post schema
CREATE TABLE IF NOT EXISTS social_post.entity_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('league', 'team')),
  league_id UUID REFERENCES sports_data.league(id) ON DELETE CASCADE,
  team_id UUID REFERENCES sports_data.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Constraint: exactly one of league_id or team_id must be set
  CONSTRAINT entity_follows_one_entity CHECK (
    (league_id IS NOT NULL AND team_id IS NULL) OR 
    (league_id IS NULL AND team_id IS NOT NULL)
  ),
  
  -- Constraint: no duplicates
  CONSTRAINT entity_follows_unique UNIQUE (user_id, league_id, team_id)
);

-- Create indexes for performance
CREATE INDEX idx_entity_follows_user_id ON social_post.entity_follows(user_id);
CREATE INDEX idx_entity_follows_league_id ON social_post.entity_follows(league_id) WHERE league_id IS NOT NULL;
CREATE INDEX idx_entity_follows_team_id ON social_post.entity_follows(team_id) WHERE team_id IS NOT NULL;

-- Enable RLS
ALTER TABLE social_post.entity_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own follows
CREATE POLICY "Users can view their own follows"
  ON social_post.entity_follows
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own follows
CREATE POLICY "Users can create their own follows"
  ON social_post.entity_follows
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows"
  ON social_post.entity_follows
  FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can count follows (for displaying follower counts)
CREATE POLICY "Anyone can count follows"
  ON social_post.entity_follows
  FOR SELECT
  USING (true);