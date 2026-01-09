-- Create the match_boxscore table in sports_data schema
CREATE TABLE sports_data.match_boxscore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FK to match
  match_id UUID NOT NULL REFERENCES sports_data.match(id) ON DELETE CASCADE,
  
  -- FK to team (nullable if no match found)
  team_id UUID REFERENCES sports_data.teams(id),
  
  -- Highlightly provider ID
  team_provider_id BIGINT NOT NULL,
  
  -- Denormalized team info
  team_name TEXT NOT NULL,
  team_logo TEXT,
  
  -- Players data as JSONB array
  players JSONB NOT NULL DEFAULT '[]',
  
  -- Raw API response for reference
  raw_data JSONB,
  
  -- Provider source
  provider TEXT DEFAULT 'highlightly',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: one record per match + team
  UNIQUE(match_id, team_provider_id)
);

-- Index for match lookups
CREATE INDEX idx_match_boxscore_match_id ON sports_data.match_boxscore(match_id);

-- Enable RLS
ALTER TABLE sports_data.match_boxscore ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view match boxscore" ON sports_data.match_boxscore
  FOR SELECT USING (true);

-- Service role can manage
CREATE POLICY "Service role can manage boxscore" ON sports_data.match_boxscore
  FOR ALL USING (auth.role() = 'service_role');