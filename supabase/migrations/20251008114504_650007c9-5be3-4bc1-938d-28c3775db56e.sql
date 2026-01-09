-- Create social_post schema
CREATE SCHEMA IF NOT EXISTS social_post;

-- =============================================
-- TABLE: social_post.predictions
-- =============================================
CREATE TABLE social_post.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  analysis TEXT,
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  hashtags TEXT[] DEFAULT '{}',
  
  -- Visibility & status
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'subscribers_only')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void', 'cancelled')),
  is_won BOOLEAN,
  settled_at TIMESTAMPTZ,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Stream integration
  stream_activity_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 1 AND confidence <= 5)),
  CONSTRAINT settled_when_final CHECK (
    (status IN ('won', 'lost', 'void') AND settled_at IS NOT NULL AND is_won IS NOT NULL) OR
    (status IN ('pending', 'cancelled') AND settled_at IS NULL)
  )
);

-- =============================================
-- TABLE: social_post.selections
-- =============================================
CREATE TABLE social_post.selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parent references (exactly one must be set)
  prediction_id UUID REFERENCES social_post.predictions(id) ON DELETE CASCADE,
  bet_id UUID, -- Will reference public.bets(id) in future
  
  -- Match references
  azuro_id TEXT REFERENCES sports_data.stg_azuro_games(azuro_game_id) ON DELETE SET NULL,
  match_id UUID REFERENCES sports_data.match(id) ON DELETE SET NULL,
  match_data JSONB, -- Store match details (teams, league, date, etc.)
  
  -- Selection details
  market TEXT NOT NULL,
  outcome TEXT NOT NULL,
  odds NUMERIC(10,2) NOT NULL CHECK (odds > 0),
  
  -- Azuro-specific
  condition_id TEXT,
  outcome_id TEXT,
  
  -- Result
  is_won BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint: exactly one parent
  CONSTRAINT exactly_one_parent CHECK (num_nonnulls(prediction_id, bet_id) = 1)
);

-- =============================================
-- INDEXES
-- =============================================

-- Predictions indexes
CREATE INDEX idx_predictions_user_id ON social_post.predictions(user_id);
CREATE INDEX idx_predictions_status ON social_post.predictions(status);
CREATE INDEX idx_predictions_created_at ON social_post.predictions(created_at DESC);
CREATE INDEX idx_predictions_visibility ON social_post.predictions(visibility);
CREATE INDEX idx_predictions_stream_activity ON social_post.predictions(stream_activity_id) WHERE stream_activity_id IS NOT NULL;

-- Selections indexes
CREATE INDEX idx_selections_prediction_id ON social_post.selections(prediction_id) WHERE prediction_id IS NOT NULL;
CREATE INDEX idx_selections_bet_id ON social_post.selections(bet_id) WHERE bet_id IS NOT NULL;
CREATE INDEX idx_selections_azuro_id ON social_post.selections(azuro_id) WHERE azuro_id IS NOT NULL;
CREATE INDEX idx_selections_match_id ON social_post.selections(match_id) WHERE match_id IS NOT NULL;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at on predictions
CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON social_post.predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE social_post.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post.selections ENABLE ROW LEVEL SECURITY;

-- Predictions policies
CREATE POLICY "Users can view their own predictions"
  ON social_post.predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public predictions"
  ON social_post.predictions FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can create their own predictions"
  ON social_post.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
  ON social_post.predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
  ON social_post.predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Selections policies
CREATE POLICY "Users can view selections of predictions they can see"
  ON social_post.selections FOR SELECT
  USING (
    prediction_id IN (
      SELECT id FROM social_post.predictions
      WHERE auth.uid() = user_id OR visibility = 'public'
    )
  );

CREATE POLICY "Users can create selections for their own predictions"
  ON social_post.selections FOR INSERT
  WITH CHECK (
    prediction_id IN (
      SELECT id FROM social_post.predictions WHERE auth.uid() = user_id
    )
  );

CREATE POLICY "Users can update selections of their own predictions"
  ON social_post.selections FOR UPDATE
  USING (
    prediction_id IN (
      SELECT id FROM social_post.predictions WHERE auth.uid() = user_id
    )
  );

CREATE POLICY "Users can delete selections of their own predictions"
  ON social_post.selections FOR DELETE
  USING (
    prediction_id IN (
      SELECT id FROM social_post.predictions WHERE auth.uid() = user_id
    )
  );