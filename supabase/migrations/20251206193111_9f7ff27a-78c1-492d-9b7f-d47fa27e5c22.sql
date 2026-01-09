-- Create h2h_records table in sports_data schema
CREATE TABLE sports_data.h2h_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_1_id UUID NOT NULL REFERENCES sports_data.teams(id),
  team_2_id UUID NOT NULL REFERENCES sports_data.teams(id),
  
  -- 5 FK columns for recent matches
  match_1_id UUID REFERENCES sports_data.match(id) ON DELETE SET NULL,
  match_2_id UUID REFERENCES sports_data.match(id) ON DELETE SET NULL,
  match_3_id UUID REFERENCES sports_data.match(id) ON DELETE SET NULL,
  match_4_id UUID REFERENCES sports_data.match(id) ON DELETE SET NULL,
  match_5_id UUID REFERENCES sports_data.match(id) ON DELETE SET NULL,
  
  -- Summary stats
  total_matches INTEGER DEFAULT 0,
  team_1_wins INTEGER DEFAULT 0,
  team_2_wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  
  -- Timestamps
  last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints: unique ordered pair to avoid duplicates
  CONSTRAINT h2h_unique_pair UNIQUE (team_1_id, team_2_id),
  CONSTRAINT h2h_team_order CHECK (team_1_id < team_2_id)
);

-- Index for fast lookups
CREATE INDEX idx_h2h_teams ON sports_data.h2h_records(team_1_id, team_2_id);

-- Trigger for updated_at
CREATE TRIGGER update_h2h_records_updated_at
  BEFORE UPDATE ON sports_data.h2h_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();